import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api', 
  timeout: 5000,   
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const response = error.response
      const data = response?.data
      if (data.status === 401) {
        // 401 Unauthorized 처리 (예: 토큰 만료)
      }
    }
    return Promise.reject(error);
  }
);