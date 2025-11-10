import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/signup', userData);
export const getUserProfile = (userId) => {
  const url = userId ? `/users/${userId}/profile` : '/users/profile';
  return api.get(url);
};

// Posts API calls
export const posts = {
  create: (postData) => api.post('/posts', postData),
  getAll: (page = 1, limit = 10, filter = 'all', search = '') => {
    let url = `/posts?page=${page}&limit=${limit}&filter=${filter}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return api.get(url);
  },
  getById: (id) => api.get(`/posts/${id}`),
  update: (id, postData) => api.put(`/posts/${id}`, postData),
  delete: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  commentPost: (id, text) => api.post(`/posts/${id}/comment`, { text }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),
  toggleSavePost: (postId) => api.post(`/users/posts/${postId}/save`)
};

// User API calls
export const users = {
  getById: (userId) => api.get(`/users/${userId}/profile`),
  getPosts: (userId) => {
    const url = userId ? `/users/${userId}/posts` : '/users/posts';
    return api.get(url);
  },
  getStats: () => api.get('/users/stats'),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  updateProfile: (formData) => 
    api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteAccount: () => api.delete('/users/profile'),
  getSavedPosts: () => api.get('/users/saved/posts'),
  follow: (userId) => api.post(`/users/follow/${userId}`),
  unfollow: (userId) => api.post(`/users/unfollow/${userId}`)
};

// AI Post Generation
export const generateContent = (prompt) => api.post('/posts/generate', { prompt });

export default api;
