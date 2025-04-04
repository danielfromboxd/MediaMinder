import axios from 'axios';
import { MediaType } from '@/contexts/MediaTrackingContext';

// Function to determine the correct API URL based on environment
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    // Use localhost during development
    return 'http://localhost:5000/api';
  } else {
    // Use the deployed backend URL in production
    return 'https://mediaminder-vnr9.onrender.com/api';
  }
};

// Create an axios instance with updated configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  // Add withCredentials to properly handle CORS with credentials
  withCredentials: true
});

// Add a request interceptor to add the token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't handle auth errors for login/register endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                            originalRequest.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        try {
          // Try to refresh token
          const response = await api.post('/auth/refresh');
          const newToken = response.data.token;
          
          if (newToken) {
            // Store new token
            localStorage.setItem('token', newToken);
            
            // Update the authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            // Retry the original request with new token
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          
          // Clear authentication and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/sign-in';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to map the media type to the backend format
const mapMediaTypeToBackend = (type: string): string => {
  if (type === 'tvshow') return 'series';
  return type;
};

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log("Sending login request to API");
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log("Login API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Login API error:", error.response?.data || error.message);
      throw error;
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    console.log("Sending registration request to API");
    try {
      const response = await api.post('/auth/register', { username, email, password });
      console.log("Register API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Register API error:", error.response?.data || error.message);
      throw error;
    }
  },
  
  verify: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error("Token verification failed:", error);
      throw error;
    }
  },
  
  refresh: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }
};

// Media tracking API calls
export const mediaAPI = {
  getUserMedia: async () => {
    console.log("Calling API: GET /media");
    try {
      const response = await api.get('/media');
      console.log("API response (getUserMedia):", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API error (getUserMedia):", error.response || error);
      throw error;
    }
  },
  
  // Updated addMedia function that accepts a single object but maps the type
  addMedia: async (mediaData: any) => {
    try {
      console.log("Raw mediaData received:", JSON.stringify(mediaData));
      
      const requestData = {
        media_id: mediaData.media_id,
        media_type: mediaData.media_type,
        status: mediaData.status,
        title: mediaData.title,
        poster_path: mediaData.poster_path
      };
      
      console.log("Sending to backend:", JSON.stringify(requestData));
      const response = await api.post('/media', requestData);
      return response.data;
    } catch (error) {
      console.error("API error (addMedia):", error);
      throw error;
    }
  },
  
  updateMediaStatus: async (mediaId: number, status: string) => {
    console.log(`Calling API: PATCH /media/${mediaId} with status:`, status);
    try {
      const response = await api.patch(`/media/${mediaId}`, { status });
      console.log("API response (updateMediaStatus):", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API error (updateMediaStatus):", error.response || error);
      throw error;
    }
  },
  
  updateMediaRating: async (mediaId: number, rating: number) => {
    console.log(`Calling API: PATCH /media/${mediaId} with rating:`, rating);
    try {
      const response = await api.patch(`/media/${mediaId}`, { rating });
      console.log("API response (updateMediaRating):", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API error (updateMediaRating):", error.response || error);
      throw error;
    }
  },
  
  deleteMedia: async (mediaId: number) => {
    console.log(`Calling API: DELETE /media/${mediaId}`);
    try {
      const response = await api.delete(`/media/${mediaId}`);
      console.log("API response (deleteMedia):", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API error (deleteMedia):", error.response || error);
      throw error;
    }
  },
};

// Add this after your other API exports
export const userAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data.user;
    } catch (error: any) {
      console.error("API error (getProfile):", error.response || error);
      throw error;
    }
  },
  
  updateProfile: async (userData: any) => {
    try {
      const response = await api.put('/user/profile', userData);
      return response.data;
    } catch (error: any) {
      console.error("API error (updateProfile):", error.response || error);
      throw error;
    }
  },
  
  deleteAccount: async () => {
    try {
      const response = await api.delete('/user/account');
      return response.data;
    } catch (error: any) {
      console.error("API error (deleteAccount):", error.response || error);
      throw error;
    }
  }
};