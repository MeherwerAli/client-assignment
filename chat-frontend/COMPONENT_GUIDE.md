# 🧩 Component Guide

Comprehensive documentation for all React components in the Smart Chat Frontend.

## 📋 Table of Contents

- [🏗️ Component Architecture](#️-component-architecture)
- [📱 Core Components](#-core-components)
- [🎨 UI Components](#-ui-components)
- [🔧 Utility Components](#-utility-components)
- [📐 Component Patterns](#-component-patterns)
- [🧪 Testing Components](#-testing-components)

## 🏗️ Component Architecture

```
App (Root)
├── ErrorBoundary (Error Handling)
├── ChatProvider (State Management)
└── Layout
    ├── SessionList (Sidebar)
    │   ├── SessionItem
    │   ├── CreateSessionButton
    │   └── FavoriteFilter
    └── ChatInterface (Main Area)
        ├── ChatHeader
        ├── MessageList
        │   └── MessageBubble
        ├── MessageInput
        └── SmartChatToggle
```

## 📱 Core Components

### App.tsx
**Purpose**: Root application component with global providers and routing.

```typescript
interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <ErrorBoundary>
      <ChatProvider>
        <div className="h-screen bg-gray-50 flex">
          <SessionList />
          <ChatInterface />
        </div>
      </ChatProvider>
    </ErrorBoundary>
  );
};
```

**Features**:
- Global error boundary wrapper
- Chat state provider initialization
- Responsive layout structure
- Theme and styling setup

**Props**: None

**Dependencies**:
- `ErrorBoundary`
- `ChatProvider`
- `SessionList`
- `ChatInterface`

---

### SessionList.tsx
**Purpose**: Sidebar component for managing chat sessions.

```typescript
interface SessionListProps {
  className?: string;
}

const SessionList: React.FC<SessionListProps> = ({ className }) => {
  const { sessions, currentSession, loading, createSession, selectSession } = useChat();
  
  return (
    <aside className={`w-80 bg-white border-r border-gray-200 flex flex-col ${className}`}>
      <SessionListHeader />
      <CreateSessionButton onClick={createSession} />
      <FavoriteFilter />
      <SessionItems 
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={selectSession}
        loading={loading}
      />
    </aside>
  );
};
```

**Features**:
- Session creation and management
- Favorite filtering and toggling
- Session search functionality
- Drag-and-drop reordering
- Context menu actions

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS classes |

**State**:
- Local search filter state
- Favorite filter toggle
- Context menu visibility

**Dependencies**:
- `useChat` hook for session management
- `SessionItem` for individual sessions
- `CreateSessionButton` for session creation

---

### ChatInterface.tsx
**Purpose**: Main chat area for message display and input.

```typescript
interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const { 
    currentSession, 
    messages, 
    loading, 
    sendMessage, 
    loadMessages 
  } = useChat();

  return (
    <main className={`flex-1 flex flex-col ${className}`}>
      <ChatHeader session={currentSession} />
      <MessageList 
        messages={messages}
        loading={loading}
        sessionId={currentSession?._id}
      />
      <MessageInput 
        onSendMessage={sendMessage}
        disabled={!currentSession || loading}
      />
    </main>
  );
};
```

**Features**:
- Real-time message display
- Auto-scrolling to latest messages
- Message input with keyboard shortcuts
- Smart chat mode toggle
- Typing indicators
- Message status indicators

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS classes |

**State**:
- Message input value
- Smart chat mode toggle
- Auto-scroll behavior

**Dependencies**:
- `useChat` hook for message operations
- `ChatHeader` for session info
- `MessageList` for message display
- `MessageInput` for sending messages

---

### MessageBubble.tsx
**Purpose**: Individual message display component.

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
  showTimestamp?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLast = false,
  showTimestamp = true,
  onEdit,
  onDelete,
}) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`
        max-w-xs lg:max-w-md px-4 py-2 rounded-lg
        ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}
        ${isSystem ? 'bg-yellow-100 text-yellow-800 italic' : ''}
      `}>
        <MessageContent content={message.content} />
        {showTimestamp && (
          <MessageTimestamp 
            timestamp={message.createdAt}
            sender={message.sender}
          />
        )}
        <MessageActions 
          message={message}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
```

**Features**:
- Sender-based styling (user vs assistant vs system)
- Timestamp display
- Message actions (edit, delete, copy)
- Markdown content rendering
- Link detection and highlighting
- Code block syntax highlighting

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `ChatMessage` | Required | Message data object |
| `isLast` | `boolean` | `false` | Whether this is the last message |
| `showTimestamp` | `boolean` | `true` | Show message timestamp |
| `onEdit` | `function` | `undefined` | Edit message callback |
| `onDelete` | `function` | `undefined` | Delete message callback |

**Dependencies**:
- `ChatMessage` type definition
- `MessageContent` for content rendering
- `MessageTimestamp` for time display
- `MessageActions` for interaction buttons

## 🎨 UI Components

### LoadingSpinner.tsx
**Purpose**: Reusable loading indicator component.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'text-blue-500',
    gray: 'text-gray-500',
    white: 'text-white',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        animate-spin rounded-full border-2 border-t-transparent
        ${sizeClasses[size]} ${colorClasses[color]}
      `} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};
```

**Features**:
- Multiple size variants
- Color customization
- Optional loading text
- Smooth animations

---

### Button.tsx
**Purpose**: Reusable button component with variants.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" color="white" />
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
```

## 🔧 Utility Components

### ErrorBoundary.tsx
**Purpose**: Global error handling and recovery.

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

**Features**:
- Catches JavaScript errors in component tree
- Displays fallback UI for errors
- Logs error details for debugging
- Provides error recovery options

---

### ProtectedRoute.tsx
**Purpose**: Route protection and authentication.

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredAuth = true,
  fallback = <LoadingSpinner />,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  if (requiredAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

## 📐 Component Patterns

### 1. Container/Presentational Pattern

```typescript
// Container Component (Smart)
const SessionListContainer: React.FC = () => {
  const { sessions, loading, error } = useChat();
  
  return (
    <SessionListPresentation 
      sessions={sessions}
      loading={loading}
      error={error}
    />
  );
};

// Presentational Component (Dumb)
interface SessionListPresentationProps {
  sessions: ChatSession[];
  loading: boolean;
  error: string | null;
}

const SessionListPresentation: React.FC<SessionListPresentationProps> = ({
  sessions,
  loading,
  error,
}) => {
  // Pure rendering logic only
};
```

### 2. Compound Component Pattern

```typescript
const Modal = ({ children, isOpen, onClose }) => {
  return isOpen ? (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  ) : null;
};

Modal.Header = ({ children }) => (
  <div className="modal-header">{children}</div>
);

Modal.Body = ({ children }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

// Usage
<Modal isOpen={showModal} onClose={handleClose}>
  <Modal.Header>Delete Session</Modal.Header>
  <Modal.Body>Are you sure you want to delete this session?</Modal.Body>
  <Modal.Footer>
    <Button onClick={handleDelete}>Delete</Button>
    <Button onClick={handleClose}>Cancel</Button>
  </Modal.Footer>
</Modal>
```

### 3. Render Props Pattern

```typescript
interface WithLoadingProps<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
  children: (props: { data: T; loading: boolean; error: string | null }) => React.ReactNode;
}

const WithLoading = <T,>({ loading, data, error, children }: WithLoadingProps<T>) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  return <>{children({ data, loading, error })}</>;
};

// Usage
<WithLoading loading={loading} data={sessions} error={error}>
  {({ data }) => (
    <SessionList sessions={data} />
  )}
</WithLoading>
```

### 4. Higher-Order Component Pattern

```typescript
function withErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return (props: P) => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
}

// Usage
const SafeSessionList = withErrorHandling(SessionList);
```

## 🧪 Testing Components

### Test Structure

```typescript
// SessionList.test.tsx
describe('SessionList Component', () => {
  const mockProps = {
    sessions: mockSessions,
    currentSession: null,
    onSelectSession: jest.fn(),
    onCreateSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders session list correctly', () => {
    render(<SessionList {...mockProps} />);
    expect(screen.getByText('Chat Sessions')).toBeInTheDocument();
  });

  it('calls onSelectSession when session is clicked', async () => {
    render(<SessionList {...mockProps} />);
    const sessionItem = screen.getByText(mockSessions[0].title);
    
    await userEvent.click(sessionItem);
    
    expect(mockProps.onSelectSession).toHaveBeenCalledWith(mockSessions[0]);
  });

  it('handles loading state correctly', () => {
    render(<SessionList {...mockProps} loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles empty state correctly', () => {
    render(<SessionList {...mockProps} sessions={[]} />);
    expect(screen.getByText('No sessions yet')).toBeInTheDocument();
  });
});
```

### Testing Utilities

```typescript
// utils/testHelpers.ts
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: {
    initialState?: Partial<ChatState>;
    [key: string]: any;
  }
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChatProvider initialState={options?.initialState}>
      {children}
    </ChatProvider>
  );

  return render(ui, { wrapper, ...options });
};

export const mockChatSession = (overrides?: Partial<ChatSession>): ChatSession => ({
  _id: 'test-session-1',
  title: 'Test Session',
  isFavorite: false,
  lastMessageAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const mockChatMessage = (overrides?: Partial<ChatMessage>): ChatMessage => ({
  _id: 'test-message-1',
  sessionId: 'test-session-1',
  sender: 'user',
  content: 'Test message content',
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

### Component Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Accessible Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test User Interactions**: Simulate real user behavior with `userEvent`
4. **Mock External Dependencies**: Mock API calls and external services
5. **Test Edge Cases**: Empty states, loading states, error states
6. **Keep Tests Isolated**: Each test should be independent and not rely on others

---

**This guide covers all major components and patterns used in the Smart Chat Frontend. For specific implementation details, refer to the individual component files in the `src/components` directory.**
