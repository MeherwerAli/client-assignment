import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { ChatSession, ChatMessage } from '../types/api';
import chatAPI from '../services/chatAPI';
import { useUserContext } from './UserContext';
import { useApiKey } from './ApiKeyContext';

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession | null }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: ChatSession }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_MESSAGES'; payload: ChatMessage[] };

const initialState: ChatState = {
  sessions: [],
  currentSession: null,
  messages: [],
  loading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload, messages: [] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_SESSION':
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
        currentSession: state.currentSession?.id === action.payload.id ? action.payload : state.currentSession
      };
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
        currentSession: state.currentSession?.id === action.payload ? null : state.currentSession,
        messages: state.currentSession?.id === action.payload ? [] : state.messages
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'ADD_MESSAGES':
      return { ...state, messages: [...state.messages, ...action.payload] };
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  actions: {
    loadSessions: () => Promise<void>;
    createSession: (title?: string) => Promise<ChatSession>;
    selectSession: (session: ChatSession) => Promise<void>;
    renameSession: (sessionId: string, title: string) => Promise<void>;
    toggleFavorite: (sessionId: string, isFavorite: boolean) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    loadMessages: (sessionId: string, limit?: number, skip?: number) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    sendSmartMessage: (content: string, context?: any) => Promise<void>;
  };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { userId } = useUserContext();
  const { apiKey } = useApiKey();

  // Helper function to handle API errors with specific authentication error handling
  const handleApiError = (error: any, fallbackMessage: string) => {
    if (error.name === 'AuthenticationError') {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else if (error.name === 'APIError') {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else {
      dispatch({ type: 'SET_ERROR', payload: fallbackMessage });
    }
  };

  const loadSessions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessions = await chatAPI.getSessions();
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (error) {
      handleApiError(error, 'Failed to load sessions');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const actions = {
    loadSessions,

    createSession: async (title: string = "New Chat"): Promise<ChatSession> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const session = await chatAPI.createSession({ title });
        dispatch({ type: 'ADD_SESSION', payload: session });
        return session;
      } catch (error) {
        handleApiError(error, 'Failed to create session');
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    selectSession: async (session: ChatSession) => {
      console.log('Selecting session:', session);
      try {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
        await actions.loadMessages(session.id);
      } catch (error) {
        console.error('Failed to select session:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to select session' });
      }
    },

    renameSession: async (sessionId: string, title: string) => {
      try {
        const updatedSession = await chatAPI.renameSession(sessionId, { title });
        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to rename session' });
      }
    },

    toggleFavorite: async (sessionId: string, isFavorite: boolean) => {
      try {
        const updatedSession = await chatAPI.toggleFavorite(sessionId, { isFavorite });
        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle favorite' });
      }
    },

    deleteSession: async (sessionId: string) => {
      try {
        await chatAPI.deleteSession(sessionId);
        dispatch({ type: 'DELETE_SESSION', payload: sessionId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete session' });
      }
    },

    loadMessages: async (sessionId: string, limit = 50, skip = 0) => {
      console.log('Loading messages for session:', sessionId, 'limit:', limit, 'skip:', skip);
      try {
        const messages = await chatAPI.getMessages(sessionId, { limit, skip });
        console.log('Messages loaded:', messages);
        if (skip === 0) {
          dispatch({ type: 'SET_MESSAGES', payload: messages.reverse() });
        } else {
          dispatch({ type: 'ADD_MESSAGES', payload: messages.reverse() });
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
      }
    },

    sendMessage: async (content: string) => {
      if (!state.currentSession) {
        console.log('No current session selected');
        return;
      }
      
      console.log('Sending message:', content, 'to session:', state.currentSession.id);
      
      try {
        const message = await chatAPI.addMessage(state.currentSession.id, {
          sender: 'user',
          content
        });
        console.log('Message sent successfully:', message);
        dispatch({ type: 'ADD_MESSAGE', payload: message });

        // Auto-rename "New Chat" sessions to first message content
        if (state.currentSession.title === "New Chat" && state.messages.length === 0) {
          const newTitle = content.length > 50 ? content.substring(0, 50) + '...' : content;
          try {
            const updatedSession = await chatAPI.renameSession(state.currentSession.id, { title: newTitle });
            dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
          } catch (error) {
            console.error('Failed to auto-rename session:', error);
          }
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
      }
    },

    sendSmartMessage: async (content: string, context?: any) => {
      if (!state.currentSession) {
        console.log('No current session selected for smart chat');
        return;
      }
      
      console.log('Sending smart message:', content, 'to session:', state.currentSession.id);
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Send the smart chat request which handles both user message and AI response
        const response = await chatAPI.smartChat(state.currentSession.id, {
          message: content,
          context: context ? JSON.stringify(context) : undefined,
          customApiKey: apiKey || undefined
        });
        console.log('Smart chat response received:', response);
        
        // Add the user message from the response
        if (response.userMessage) {
          const userMessage: ChatMessage = {
            id: response.userMessage.id,
            sessionId: state.currentSession.id,
            sender: 'user',
            content: response.userMessage.content,
            createdAt: response.userMessage.timestamp,
            updatedAt: response.userMessage.timestamp
          };
          console.log('Adding user message to chat:', userMessage);
          dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        }
        
        // Add the AI response
        if (response.assistantMessage) {
          const aiMessage: ChatMessage = {
            id: response.assistantMessage.id,
            sessionId: state.currentSession.id,
            sender: 'assistant',
            content: response.assistantMessage.content,
            createdAt: response.assistantMessage.timestamp,
            updatedAt: response.assistantMessage.timestamp
          };
          console.log('Adding AI response to chat:', aiMessage);
          dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
        }

        // Auto-rename "New Chat" sessions to first message content
        const currentMessageCount = state.messages.length;
        if (state.currentSession.title === "New Chat" && currentMessageCount === 0) {
          const newTitle = content.length > 50 ? content.substring(0, 50) + '...' : content;
          try {
            const updatedSession = await chatAPI.renameSession(state.currentSession.id, { title: newTitle });
            dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
          } catch (error) {
            console.error('Failed to auto-rename session:', error);
          }
        }
      } catch (error) {
        handleApiError(error, 'Failed to send smart message');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
  };

  // Load sessions on mount and when userId changes
  useEffect(() => {
    loadSessions();
    // Clear current session and messages when user changes
    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
  }, [userId, loadSessions]);

  return (
    <ChatContext.Provider value={{ state, actions }}>
      {children}
    </ChatContext.Provider>
  );
}