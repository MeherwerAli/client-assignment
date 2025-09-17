import React, { useState, useEffect } from 'react';
import { Key, Check, X, Eye, EyeOff, Settings, Shield } from 'lucide-react';

interface ApiKeySettingsProps {
  onApiKeyChange?: (apiKey: string) => void;
  onServiceKeyChange?: (serviceKey: string) => void;
}

export function ApiKeySettings({ onApiKeyChange, onServiceKeyChange }: ApiKeySettingsProps) {
  // OpenAI API Key state
  const [openaiApiKey, setOpenaiApiKey] = useState(() => {
    return localStorage.getItem('chat-openai-api-key') || '';
  });
  const [openaiInputValue, setOpenaiInputValue] = useState(openaiApiKey);
  const [isEditingOpenai, setIsEditingOpenai] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [openaiError, setOpenaiError] = useState<string | null>(null);

  // Service Auth Key state
  const [serviceApiKey, setServiceApiKey] = useState(() => {
    return localStorage.getItem('chat-service-auth-key') || 'dev-api-key-2024';
  });
  const [serviceInputValue, setServiceInputValue] = useState(serviceApiKey);
  const [isEditingService, setIsEditingService] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  useEffect(() => {
    setOpenaiInputValue(openaiApiKey);
  }, [openaiApiKey]);

  useEffect(() => {
    setServiceInputValue(serviceApiKey);
  }, [serviceApiKey]);

  const isValidOpenaiKey = (key: string): boolean => {
    if (!key) return false;
    return key.startsWith('sk-') && key.length > 20;
  };

  const isValidServiceKey = (key: string): boolean => {
    if (!key) return false;
    return key.length >= 8; // Minimum length for service auth key
  };

  const handleOpenaiSave = () => {
    if (!isValidOpenaiKey(openaiInputValue)) {
      setOpenaiError('Please enter a valid OpenAI API key (should start with "sk-" and be at least 20 characters)');
      return;
    }

    setOpenaiError(null);
    setOpenaiApiKey(openaiInputValue);
    localStorage.setItem('chat-openai-api-key', openaiInputValue);
    setIsEditingOpenai(false);
    onApiKeyChange?.(openaiInputValue);
  };

  const handleServiceSave = () => {
    if (!isValidServiceKey(serviceInputValue)) {
      setServiceError('Please enter a valid service API key (at least 8 characters)');
      return;
    }

    setServiceError(null);
    setServiceApiKey(serviceInputValue);
    localStorage.setItem('chat-service-auth-key', serviceInputValue);
    setIsEditingService(false);
    onServiceKeyChange?.(serviceInputValue);
  };

  const handleOpenaiCancel = () => {
    setOpenaiInputValue(openaiApiKey);
    setOpenaiError(null);
    setIsEditingOpenai(false);
    setShowOpenaiKey(false);
  };

  const handleServiceCancel = () => {
    setServiceInputValue(serviceApiKey);
    setServiceError(null);
    setIsEditingService(false);
    setShowServiceKey(false);
  };

  const handleOpenaiKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOpenaiSave();
    } else if (e.key === 'Escape') {
      handleOpenaiCancel();
    }
  };

  const handleServiceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleServiceSave();
    } else if (e.key === 'Escape') {
      handleServiceCancel();
    }
  };

  const maskApiKey = (key: string): string => {
    if (!key) return '';
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '•'.repeat(Math.min(key.length - 8, 20)) + (key.length > 28 ? key.substring(key.length - 4) : '');
  };

  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">API Configuration</span>
      </div>
      
      {/* Service Authentication Key */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-3 w-3 text-blue-500" />
          <span className="text-xs font-medium text-gray-600">Service Auth Key</span>
        </div>
        
        {!isEditingService ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {serviceApiKey ? maskApiKey(serviceApiKey) : 'No service key configured'}
                </span>
              </div>
              <button
                onClick={() => setIsEditingService(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Change
              </button>
            </div>
            
            <div className="text-xs text-blue-50 bg-blue-600 p-2 rounded border border-blue-700">
              <strong>Service Authentication:</strong> This key authorizes access to the chat service API endpoints.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <div className="flex-1 relative">
                  <input
                    type={showServiceKey ? 'text' : 'password'}
                    value={serviceInputValue}
                    onChange={(e) => setServiceInputValue(e.target.value)}
                    onKeyDown={handleServiceKeyPress}
                    placeholder="Enter service authentication key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowServiceKey(!showServiceKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showServiceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {serviceError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {serviceError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleServiceSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <Check className="h-3 w-3" />
                Save
              </button>
              <button
                onClick={handleServiceCancel}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OpenAI API Key */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-3 bg-green-500 rounded-sm"></div>
          <span className="text-xs font-medium text-gray-600">OpenAI API Key</span>
        </div>
        
        {!isEditingOpenai ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {openaiApiKey ? maskApiKey(openaiApiKey) : 'Using server default'}
                </span>
              </div>
              <button
                onClick={() => setIsEditingOpenai(true)}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                {openaiApiKey ? 'Change' : 'Set Custom'}
              </button>
            </div>
            
            {!openaiApiKey && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                <strong>Note:</strong> Using server's default OpenAI key. Set your own for personalized usage tracking.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <div className="flex-1 relative">
                  <input
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiInputValue}
                    onChange={(e) => setOpenaiInputValue(e.target.value)}
                    onKeyDown={handleOpenaiKeyPress}
                    placeholder="Enter your OpenAI or OpenRouter API key (sk-...)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {openaiError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {openaiError}
              </div>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
              <strong>Supported providers:</strong>
              <ul className="mt-1 space-y-1">
                <li>• OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Get API key</a></li>
                <li>• OpenRouter: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Get API key</a></li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenaiSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                <Check className="h-3 w-3" />
                Save
              </button>
              <button
                onClick={handleOpenaiCancel}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
