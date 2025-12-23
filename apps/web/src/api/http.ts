import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Определяем API URL на основе окружения
const getApiUrl = (): string => {
  // Приоритет: переменная окружения > production относительный путь > development localhost
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // В production используем относительный путь (nginx проксирует /api на бекенд)
  if (import.meta.env.PROD) {
    return '';
  }
  
  // В development используем localhost
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();
const API_BASE = API_URL || '/api';

const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для обновления токена
async function refreshToken(): Promise<string | null> {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) {
    return null;
  }

  try {
    // Используем axios напрямую, чтобы избежать рекурсии
    const response = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken: refreshTokenValue,
    }, {
      baseURL: API_BASE,
    });
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        return response.data.data.accessToken;
      }
    }
    
    return null;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return null;
  }
}

// Request interceptor - добавляем токен
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обработка ошибок и обновление токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

http.interceptors.response.use(
  (response) => {
    // Извлекаем data из стандартизированного ответа
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success && 'data' in response.data) {
        return { ...response, data: response.data.data };
      }
      if (!response.data.success && 'error' in response.data) {
        return Promise.reject(new Error(response.data.error.message || 'Request failed'));
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await refreshToken();
      
      if (newToken) {
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return http(originalRequest);
      } else {
        processQueue(error, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/account/login' && window.location.pathname !== '/admin/login') {
          window.location.href = '/account/login';
        }
        return Promise.reject(error);
      }
    }

    // Обработка стандартизированных ошибок
    if (error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
      const errorData = error.response.data as { error?: { message?: string } };
      return Promise.reject(new Error(errorData.error?.message || 'Request failed'));
    }

    return Promise.reject(error);
  }
);

export default http;
