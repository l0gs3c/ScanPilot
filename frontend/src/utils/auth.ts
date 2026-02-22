// Auth utility functions
export const handleUnauthorized = () => {
  // Clear auth storage
  localStorage.removeItem('auth-storage');
  
  // Redirect to login page
  window.location.href = '/login';
};

export const getAuthHeaders = (): HeadersInit => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    const token = authStorage ? JSON.parse(authStorage).token : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer null',
    };
  }
};

export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  return response;
};