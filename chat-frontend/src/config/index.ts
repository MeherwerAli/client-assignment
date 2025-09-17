// Environment configuration for the chat frontend
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/chats-service/api/v1',
  API_KEY: process.env.REACT_APP_API_KEY || 'dev-api-key-2024',
  APP_NAME: process.env.REACT_APP_NAME || 'Smart Chat',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // Feature flags
  FEATURES: {
    SMART_CHAT: process.env.REACT_APP_ENABLE_SMART_CHAT !== 'false',
    AUTO_SAVE: process.env.REACT_APP_AUTO_SAVE !== 'false',
    FAVORITES: process.env.REACT_APP_ENABLE_FAVORITES !== 'false',
  },

  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: '320px',
    MAX_MESSAGE_LENGTH: 4000,
    MESSAGES_PER_PAGE: 50,
    AUTO_SCROLL_THRESHOLD: 100,
  },

  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;