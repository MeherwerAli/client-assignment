import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ChatProvider, useChatContext } from './context/ChatContext';
import { UserProvider } from './context/UserContext';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { ServiceKeyProvider } from './context/ServiceKeyContext';
import { SessionList } from './components/SessionList';
import { ChatInterface } from './components/ChatInterface';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorToast } from './components/ErrorToast';

function AppContent() {
  const { actions, state } = useChatContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCreateSession = async () => {
    try {
      const newSession = await actions.createSession();
      await actions.selectSession(newSession);
      setSidebarOpen(false); // Close sidebar on mobile after creating session
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <SessionList onCreateSession={handleCreateSession} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {state.currentSession?.title || 'Smart Chat'}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <ChatInterface onNewSession={handleCreateSession} />
      </div>

      {/* Global Error Toast */}
      {state.error && (
        <ErrorToast 
          message={state.error} 
          onClose={actions.clearError}
          autoClose={true}
          autoCloseDelay={6000}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ServiceKeyProvider>
        <ApiKeyProvider>
          <UserProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </UserProvider>
        </ApiKeyProvider>
      </ServiceKeyProvider>
    </ErrorBoundary>
  );
}

export default App;
