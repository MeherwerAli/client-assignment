#!/bin/sh
set -e

# Define the path to the built JavaScript files
BUILD_DIR="/usr/share/nginx/html"

# Function to replace environment variables in built files
replace_env_vars() {
  # Find all JS files in the build directory
  find "$BUILD_DIR" -name "*.js" -type f | while read -r file; do
    echo "Processing $file for environment variable replacement..."
    
    # Replace environment variable placeholders with actual values
    sed -i "s|REACT_APP_API_BASE_URL_PLACEHOLDER|${REACT_APP_API_BASE_URL:-http://localhost:3002/chats-service/api/v1}|g" "$file"
    sed -i "s|REACT_APP_API_KEY_PLACEHOLDER|${REACT_APP_API_KEY:-dev-api-key-2024}|g" "$file"
    sed -i "s|REACT_APP_NAME_PLACEHOLDER|${REACT_APP_NAME:-Smart Chat}|g" "$file"
    sed -i "s|REACT_APP_VERSION_PLACEHOLDER|${REACT_APP_VERSION:-1.0.0}|g" "$file"
    sed -i "s|REACT_APP_ENABLE_SMART_CHAT_PLACEHOLDER|${REACT_APP_ENABLE_SMART_CHAT:-true}|g" "$file"
    sed -i "s|REACT_APP_AUTO_SAVE_PLACEHOLDER|${REACT_APP_AUTO_SAVE:-true}|g" "$file"
    sed -i "s|REACT_APP_ENABLE_FAVORITES_PLACEHOLDER|${REACT_APP_ENABLE_FAVORITES:-true}|g" "$file"
  done
}

echo "Starting frontend container..."
echo "API Base URL: ${REACT_APP_API_BASE_URL:-http://localhost:3002/chats-service/api/v1}"
echo "API Key: ${REACT_APP_API_KEY:-dev-api-key-2024}"

# Replace environment variables in the built files
replace_env_vars

echo "Environment variables replaced. Starting nginx..."

# Execute the main command
exec "$@"
