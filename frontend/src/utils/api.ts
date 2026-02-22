// API configuration utility
const getApiUrl = (): string => {
  const host = import.meta.env.VITE_BACKEND_HOST || 'localhost';
  const port = import.meta.env.VITE_BACKEND_PORT || '8002';
  
  return `http://${host}:${port}`;
};

export { getApiUrl };