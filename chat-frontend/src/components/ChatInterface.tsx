import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types/api';
import { useChatContext } from '../context/ChatContext';

interface ChatInterfaceProps {
  onNewSession: () => void;
}

export function ChatInterface({ onNewSession }: ChatInterfaceProps) {
  const { state, actions } = useChatContext();
  const [message, setMessage] = useState('');
  const [isSmartMode, setIsSmartMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debug logging
  console.log('ChatInterface render - Current state:', {
    currentSession: state.currentSession,
    messagesCount: state.messages.length,
    messages: state.messages,
    loading: state.loading,
    error: state.error
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || state.loading) return;

    const messageText = message.trim();
    setMessage('');

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      if (!state.currentSession) {
        // Create a new session if none exists
        const newSession = await actions.createSession();
        await actions.selectSession(newSession);
      }

      if (isSmartMode) {
        await actions.sendSmartMessage(messageText);
      } else {
        await actions.sendMessage(messageText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid time';
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.sender === 'user';
    const isSystem = msg.sender === 'system';
    const isThinking = msg.isThinking;

    return (
      <div
        key={msg.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md xl:max-w-lg`}>
          {!isUser && (
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isSystem ? 'bg-gray-500' : 'bg-primary-500'
            }`}>
              {isSystem ? (
                <MessageSquare className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
          )}
          
          <div
            className={`rounded-lg px-3 py-2 ${
              isUser
                ? 'bg-primary-600 text-white'
                : isSystem
                ? 'bg-gray-100 text-gray-800 border'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isThinking ? (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  isUser ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {formatMessageTime(msg.createdAt)}
                </p>
              </>
            )}
          </div>

          {isUser && (
            <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!state.currentSession) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-md">
          <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Smart Chat
          </h2>
          <p className="text-gray-600 mb-6">
            Start a new conversation to begin chatting. You can send regular messages 
            or use AI-powered smart chat for enhanced responses.
          </p>
          <button
            onClick={onNewSession}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {state.currentSession.title}
            </h2>
            <p className="text-sm text-gray-500">
              {state.messages.length} messages
            </p>
          </div>
          
          {/* Smart Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Smart Mode</span>
            <button
              onClick={() => setIsSmartMode(!isSmartMode)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isSmartMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isSmartMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            {isSmartMode && <Sparkles className="h-4 w-4 text-primary-600" />}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Send your first message to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {state.messages.map(renderMessage)}
            {state.loading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={isSmartMode ? "Ask me anything..." : "Type your message..."}
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              disabled={state.loading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || state.loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        {isSmartMode && (
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-powered responses enabled
          </p>
        )}
      </div>
    </div>
  );
}