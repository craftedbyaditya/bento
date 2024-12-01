import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types';
import { cacheInstance } from '../utils/cache';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '../utils/constants/httpConstants';

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  private readonly CACHE_KEYS = {
    USER: 'user_data',
    USER_ID: 'user_id',
    PROJECT_ID: 'project_id'
  };

  private constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
              // Handle unauthorized error (e.g., redirect to login)
              break;
            case HTTP_STATUS.FORBIDDEN:
              // Handle forbidden error
              break;
            default:
              // Handle other errors
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

  public async post<T>(
    url: string, 
    data?: any, 
    config?: any
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  public async login(credentials: LoginRequest): Promise<{ data: LoginResponse; hasProjects: boolean }> {
    try {
      // Clear any existing cache before login
      cacheInstance.clear();

      const response: AxiosResponse<LoginResponse> = await this.post('/auth/v1/login', credentials);
      
      // Cache the successful response
      if (response.status === HTTP_STATUS.OK) {
        cacheInstance.set(this.CACHE_KEYS.USER, response.data);
        cacheInstance.set(this.CACHE_KEYS.USER_ID, response.data.data.id);
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
        throw new Error(
          ERROR_MESSAGES[error.response.status === HTTP_STATUS.UNAUTHORIZED
            ? ERROR_CODES.INVALID_CREDENTIALS
            : ERROR_CODES.SERVER_ERROR]
        );
      }
      throw new Error(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
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
