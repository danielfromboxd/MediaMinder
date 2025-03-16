import axios from 'axios';
import { MediaType } from '@/contexts/MediaTrackingContext';

// Create an axios instance with updated configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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