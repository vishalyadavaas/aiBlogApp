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
      console.log('Adding token to request:', {
        url: config.url,
        token: token.substring(0, 10) + '...'
      });
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/signup', userData);
export const getUserProfile = (userId) => {
  const url = userId ? `/users/${userId}/profile` : '/users/profile';
  console.log('Fetching profile from:', url);
  return api.get(url);
};

// Posts API calls
export const posts = {
  create: (postData) => api.post('/posts', postData),
  getAll: (page = 1, limit = 10, filter = 'all') => api.get(`/posts?page=${page}&limit=${limit}&filter=${filter}`),
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
    console.log('Fetching posts from:', url);
    return api.get(url);
  },
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  updateProfile: (formData) => 
    api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteAccount: () => api.delete('/users/profile'),
  getSavedPosts: () => {
    console.log('Fetching saved posts');
    return api.get('/users/saved/posts');
  },
  follow: (userId) => api.post(`/users/follow/${userId}`),
  unfollow: (userId) => api.post(`/users/unfollow/${userId}`)
};

// AI Post Generation
export const generateContent = (prompt) => api.post('/posts/generate', { prompt });

export default api;
