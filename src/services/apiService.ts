import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ApiResponse } from './types';
import { cacheInstance } from '../utils/cache';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '../utils/constants/httpConstants';

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  private readonly CACHE_KEYS = {
    USER: 'user_data',
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

  public async login(credentials: LoginRequest): Promise<{ data: LoginResponse; hasProjects: boolean }> {
    try {
      // Check cache first
      const cachedUser = cacheInstance.get(this.CACHE_KEYS.USER);
      if (cachedUser) {
        return {
          data: cachedUser,
          hasProjects: cachedUser.data.projects?.length > 0
        };
      }

      const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/v1/login', credentials);
      
      // Cache the successful response
      if (response.status === HTTP_STATUS.OK) {
        cacheInstance.set(this.CACHE_KEYS.USER, response.data);
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
      const response: AxiosResponse<RegisterResponse> = await this.api.post('/auth/v1/register', userData);
      
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
    this.removeAuthToken();
  }

  // Add other API methods here
}

export const apiService = ApiService.getInstance();
