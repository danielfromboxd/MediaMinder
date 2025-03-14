import axios from 'axios';

// Base API URL - change this to  deployed URL in production
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
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
  
  addMedia: async (media: {
    media_id: string | number;
    title: string;
    media_type: string;
    status: string;
    poster_path?: string;
    rating?: number;
    review?: string;
  }) => {
    console.log("Calling API: POST /media with data:", media);
    try {
      const response = await api.post('/media', media);
      console.log("API response (addMedia):", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API error (addMedia):", error.response || error);
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