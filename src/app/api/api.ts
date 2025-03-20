import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";
import { UserSession } from "@/types/auth";
import { User, CreateUserDto, UpdateUserDto, LoginUserDto, SignedUserDto } from "@/types/user";
import { Quiz, CreateQuizDto, UpdateQuizDto } from "@/types/quiz";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "@/types/category";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  timeout: 30000,
});

// Implement proper axios-retry functionality
const axiosRetry = (
  axiosInstance: AxiosInstance,
  options = {
    retries: 3,
    retryDelay: (retryCount: number) => retryCount * 1000,
    retryCondition: (error: any) =>
      error.response && error.response.status >= 500,
  }
) => {
  axiosInstance.interceptors.response.use(undefined, async (error) => {
    const config = error.config;

    // If there's no config or we've run out of retries, reject
    if (
      !config ||
      !options.retryCondition(error) ||
      config._retryCount >= options.retries
    ) {
      return Promise.reject(error);
    }

    // Increment retry count
    config._retryCount = config._retryCount || 0;
    config._retryCount += 1;

    // Calculate delay
    const delay = options.retryDelay(config._retryCount);

    // Wait for the delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry the request
    return axiosInstance(config);
  });
};

// Interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    const session = (await getSession()) as UserSession;
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
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  }
);

// Apply retry functionality to our API instance
axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.response && error.response.status >= 500,
});

// Authentication API
export const authApi = {
  signIn: (credentials: LoginUserDto): Promise<AxiosResponse<SignedUserDto>> =>
    api.post('/auth/signin', credentials),

  signUp: (data: CreateUserDto): Promise<AxiosResponse<User>> =>
    api.post('/auth/signup', data),
};

// Users API
export const usersApi = {
  getAll: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users'),

  getById: (id: number): Promise<AxiosResponse<User>> =>
    api.get(`/users/${id}`),

  create: (data: CreateUserDto): Promise<AxiosResponse<User>> =>
    api.post('/users', data),

  update: (id: number, data: UpdateUserDto): Promise<AxiosResponse<User>> =>
    api.patch(`/users/${id}`, data),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/users/${id}`)
};

// Quizzes API
export const quizzesApi = {
  getAll: (): Promise<AxiosResponse<Quiz[]>> =>
    api.get('/quizzes'),

  getById: (id: number): Promise<AxiosResponse<Quiz>> =>
    api.get(`/quizzes/${id}`),

  create: (data: CreateQuizDto): Promise<AxiosResponse<Quiz>> =>
    api.post('/quizzes', data),

  update: (id: number, data: UpdateQuizDto): Promise<AxiosResponse<Quiz>> =>
    api.patch(`/quizzes/${id}`, data),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/quizzes/${id}`)
};

// Categories API
export const categoriesApi = {
  getAll: (): Promise<AxiosResponse<Category[]>> =>
    api.get('/categories'),

  getById: (id: number): Promise<AxiosResponse<Category>> =>
    api.get(`/categories/${id}`),

  create: (data: CreateCategoryDto): Promise<AxiosResponse<Category>> =>
    api.post('/categories', data),

  update: (id: number, data: UpdateCategoryDto): Promise<AxiosResponse<Category>> =>
    api.patch(`/categories/${id}`, data),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/categories/${id}`)
};

// Function for retrieving users count
export const fetchUsersCount = async () => {
  try {
    const response = await usersApi.getAll();
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch (error) {
    console.error("Error fetching users count:", error);
    return 0;
  }
};

// Function for retrieving quizzes count
export const fetchQuizzesCount = async () => {
  try {
    const response = await quizzesApi.getAll();
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch (error) {
    console.error("Error fetching quizzes count:", error);
    return 0;
  }
};

// Function for retrieving categories count
export const fetchCategoriesCount = async () => {
  try {
    const response = await categoriesApi.getAll();
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch (error) {
    console.error("Error fetching categories count:", error);
    return 0;
  }
};

export const fetcher = (url: string) => api.get(url).then((res) => res.data);
