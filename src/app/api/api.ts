import axios, { AxiosInstance } from "axios";
import { getSession } from "next-auth/react";
import { UserSession } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
    },
    timeout: 30000,
});

// Implement proper axios-retry functionality
const axiosRetry = (
    axiosInstance: AxiosInstance, 
    options = { 
      retries: 3, 
      retryDelay: (retryCount: number) => retryCount * 1000,
      retryCondition: (error: any) => error.response && error.response.status >= 500
    }
  ) => {
    axiosInstance.interceptors.response.use(undefined, async (error) => {
      const config = error.config;
      
      // If there's no config or we've run out of retries, reject
      if (!config || !options.retryCondition(error) || config._retryCount >= options.retries) {
        return Promise.reject(error);
      }
  
      // Increment retry count
      config._retryCount = config._retryCount || 0;
      config._retryCount += 1;
  
      // Calculate delay
      const delay = options.retryDelay(config._retryCount);
      
      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return axiosInstance(config);
    });
};

// Interceptor to add authentication token
api.interceptors.request.use(
    async (config) => {
        const session = await getSession() as UserSession;
        if (session?.user?.token) {
            config.headers.Authorization = `Bearer ${session.user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle token expiration
            // You might want to redirect to login or refresh token here
            window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
    }
);

// Apply retry functionality to our API instance
axiosRetry(api, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => error.response && error.response.status >= 500
  });

// Fonctions pour récupérer les utilisateurs
export const fetchUsers = async () => {
    try {
        const response = await api.get('/users');
        console.log('Users API response:', response.data);
        return Array.isArray(response.data) ? response.data.length : 0;
    } catch (error) {
        console.error('Error fetching users:', error);
        return 0;
    }
};

export const fetchUsersCount = async () => {
    const response = await api.get('/users');
    console.log('Users API response:', response.data);
    return response.data.length;
};

// Fonctions pour récupérer les quiz
export const fetchQuizzes = async () => {
    try {
        const response = await api.get('/quizzes');
        console.log('Quizzes API response:', response.data);
        return Array.isArray(response.data) ? response.data.length : 0;
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return 0;
    }
};

export const fetchQuizzesCount = async () => {
    const response = await api.get('/quizzes');
    console.log('Users API response:', response.data);
    return response.data.length;
};

// Fonction pour récupérer les catégories
export const fetchCategoriesCount = async () => {
    try {
        const response = await api.get('/categories');
        return Array.isArray(response.data) ? response.data.length : 0;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return 0;
    }
};
export const fetcher = (url: string) => api.get(url).then((res) => res.data);


