import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const companyId = localStorage.getItem('activeCompanyId');
    if (companyId) {
      config.headers['x-company-id'] = companyId;
    }
  }
  return config;
});

// Optionally, we can intercept 401s here to automatically clear state,
// but for simplicity, we'll handle it via the AuthContext and route protection.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global errors here
    return Promise.reject(error);
  }
);
