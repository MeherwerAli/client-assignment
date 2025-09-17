import React, { useState, useEffect } from 'react';
import { User, Check, X } from 'lucide-react';
import { useUserContext } from '../context/UserContext';

interface UserSelectorProps {
  onUserChange?: (userId: string) => void;
}

export function UserSelector({ onUserChange }: UserSelectorProps) {
  const { userId, setUserId, isValidUserId } = useUserContext();
  const [inputValue, setInputValue] = useState(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(userId);
  }, [userId]);

  const handleSave = () => {
    if (!isValidUserId(inputValue)) {
      setError('User ID must be 1-50 characters long');
      return;
    }

    setError(null);
    setUserId(inputValue);
    setIsEditing(false);
    onUserChange?.(inputValue);
  };

  const handleCancel = () => {
    setInputValue(userId);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <User className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">User ID</span>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter user ID"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">{userId}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-300"
            >
              Edit
            </button>
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        Sessions and messages are isolated per user ID
      </p>
    </div>
  );
}
