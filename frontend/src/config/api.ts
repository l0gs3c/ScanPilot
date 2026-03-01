// API Configuration from environment variables
// Vite exposes env variables prefixed with VITE_ to the client

// In development mode, use relative URLs to leverage Vite proxy
// In production, use absolute URLs from environment
const API_BASE_URL = import.meta.env.DEV 
  ? '' // Empty string = relative URLs (Vite proxy handles forwarding)
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// Construct full API URL
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Export individual parts for flexibility
export { API_BASE_URL, API_VERSION };

// API Timeouts
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);
export const UPLOAD_TIMEOUT = parseInt(import.meta.env.VITE_UPLOAD_TIMEOUT || '300000', 10);

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ScanPilot';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Feature Flags
export const ENABLE_WEBSOCKET = import.meta.env.VITE_ENABLE_WEBSOCKET === 'true';
export const ENABLE_NOTIFICATIONS = import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true';
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

// Development Settings
export const ENABLE_DEV_TOOLS = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
export const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info';

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    API_URL,
    API_BASE_URL,
    API_VERSION,
    APP_NAME,
    APP_VERSION,
    ENABLE_WEBSOCKET,
    ENABLE_NOTIFICATIONS,
  });
}