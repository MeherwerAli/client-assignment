import React, { useState } from 'react';
import { Star, Edit2, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { ChatSession } from '../types/api';
import { useChatContext } from '../context/ChatContext';
import { UserSelector } from './UserSelector';
import { ApiKeySettings } from './ApiKeySettings';

interface SessionListProps {
  onCreateSession: () => void;
}

export function SessionList({ onCreateSession }: SessionListProps) {
  const { state, actions } = useChatContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleRename = async (sessionId: string) => {
    if (editTitle.trim()) {
      await actions.renameSession(sessionId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  const startEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(parsedDate);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const sortedSessions = [...state.sessions].sort((a, b) => {
    // Favorites first, then by last message date
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    try {
      const dateA = new Date(a.lastMessageAt);
      const dateB = new Date(b.lastMessageAt);
      
      // Check for invalid dates
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0; // Keep original order if dates are invalid
      }
      
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error('Error sorting sessions by date:', error);
      return 0;
    }
  });

  return (
    <div className="h-full flex flex-col">
      {/* User Selector */}
      <UserSelector onUserChange={() => {
        // Sessions will be automatically reloaded when user changes via the useEffect in ChatContext
      }} />
      
      {/* API Key Settings */}
      <ApiKeySettings 
        onApiKeyChange={(apiKey) => {
          console.log('OpenAI API key updated:', apiKey ? 'Set' : 'Cleared');
        }}
        onServiceKeyChange={(serviceKey) => {
          console.log('Service auth key updated:', serviceKey);
        }}
      />
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
          <button
            onClick={onCreateSession}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {state.loading && state.sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Loading sessions...
          </div>
        ) : sortedSessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p>No chat sessions yet</p>
            <p className="text-sm">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {sortedSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  state.currentSession?.id === session.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => actions.selectSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === session.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(session.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onBlur={() => handleRename(session.id)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {session.title}
                          </h3>
                          {session.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(session.lastMessageAt)}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.toggleFavorite(session.id, !session.isFavorite);
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title={session.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star 
                        className={`h-3.5 w-3.5 ${
                          session.isFavorite 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(session);
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Rename session"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this session?')) {
                          actions.deleteSession(session.id);
                        }
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}