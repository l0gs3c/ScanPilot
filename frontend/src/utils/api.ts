// API configuration utility
// Import from centralized config
import { API_BASE_URL, API_URL } from '../config/api';

/**
 * Get the base API URL (without /api/v1 prefix)
 * Example: http://localhost:8000
 */
export const getApiUrl = (): string => {
  return API_BASE_URL;
};

/**
 * Get the full API URL (with /api/v1 prefix)
 * Example: http://localhost:8000/api/v1
 */
export const getApiFullUrl = (): string => {
  return API_URL;
};

// Legacy support - keep for backward compatibility
export { API_BASE_URL, API_URL };