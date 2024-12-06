import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types';
import { cacheInstance } from '../utils/cache';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '../utils/constants/httpConstants';

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  private readonly CACHE_KEYS = {
    USER: 'user_data',
    USER_ID: 'user_id',  // Consistent key for user ID
    PROJECT_ID: 'project_id'  // Consistent key for project ID
  };

  private constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to automatically add auth headers
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const userId = this.getUserId();
        const projectId = this.getProjectId();

        // Always add user ID if available
        if (userId) {
          config.headers['x-user-id'] = userId;
        }

        // Add project ID only if available (some endpoints might not need it)
        if (projectId) {
          config.headers['x-project-id'] = projectId;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
              // Clear cache and redirect to login
              cacheInstance.clear();
              window.location.href = '/login';
              break;
            case HTTP_STATUS.FORBIDDEN:
              // Handle forbidden error
              console.error('Access forbidden:', error.response.data);
              break;
            default:
              // Handle other errors
              console.error('API Error:', error.response.data);
              break;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Add auth token to requests
  public setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove auth token
  public removeAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Get cached user ID
  public getUserId(): string | null {
    return cacheInstance.get(this.CACHE_KEYS.USER_ID);
  }

  // Get cached project ID
  public getProjectId(): string | null {
    return cacheInstance.get(this.CACHE_KEYS.PROJECT_ID);
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.getUserId();
  }

  public async post<T>(
    url: string, 
    data?: any, 
    config?: any
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  public async get<T>(
    url: string,
    config?: any
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  public async login(credentials: LoginRequest): Promise<{ data: LoginResponse; hasProjects: boolean }> {
    try {
      // Clear any existing cache before login
      cacheInstance.clear();

      const response: AxiosResponse<LoginResponse> = await this.post('/auth/v1/login', credentials);
      
      // Cache the successful response
      if (response.status === HTTP_STATUS.OK) {
        cacheInstance.set(this.CACHE_KEYS.USER, response.data);
        cacheInstance.set(this.CACHE_KEYS.USER_ID, response.data.data.id);  // Store user ID
        if (response.data.data.projects?.length > 0) {
          cacheInstance.set(this.CACHE_KEYS.PROJECT_ID, response.data.data.projects[0].project_id);
        }
      }

      return {
        data: response.data,
        hasProjects: response.data.data.projects?.length > 0
      };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Handle different error scenarios
        if (status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
          throw new Error('The server is currently unavailable. Please try again later.');
        } else if (status === HTTP_STATUS.UNAUTHORIZED) {
          throw new Error(ERROR_MESSAGES[ERROR_CODES.INVALID_CREDENTIALS]);
        } else if (errorData?.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error(ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR]);
        }
      }
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
  }

  public async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterResponse> = await this.post('/auth/v1/register', userData);
      
      // Cache the successful response
      if (response.status === HTTP_STATUS.OK || response.status === HTTP_STATUS.CREATED) {
        const userDataToCache = {
          message: response.data.message,
          data: {
            id: response.data.data.userId,
            firstName: response.data.data.firstName,
            lastName: response.data.data.lastName,
            email: response.data.data.email,
            projects: [] // New users start with no projects
          }
        };
        cacheInstance.set(this.CACHE_KEYS.USER, userDataToCache);
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR]);
      }
      throw new Error(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
    }
  }

  public logout(): void {
    cacheInstance.remove(this.CACHE_KEYS.USER);
    cacheInstance.remove(this.CACHE_KEYS.USER_ID);
    cacheInstance.remove(this.CACHE_KEYS.PROJECT_ID);
    this.removeAuthToken();
  }

}

export const apiService = ApiService.getInstance();
