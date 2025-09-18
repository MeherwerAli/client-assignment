import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ErrorToast({ 
  message, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000 
}: ErrorToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full z-50 animate-slide-up">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          {/* Error Icon */}
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          
          {/* Error Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800 break-words">
              {message}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-red-400 hover:text-red-600 transition-colors rounded"
            aria-label="Close error message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress Bar for Auto-close */}
        {autoClose && (
          <div className="mt-3">
            <div className="w-full bg-red-200 rounded-full h-1">
              <div 
                className="bg-red-500 h-1 rounded-full animate-progress"
                style={{
                  animationDuration: `${autoCloseDelay}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
