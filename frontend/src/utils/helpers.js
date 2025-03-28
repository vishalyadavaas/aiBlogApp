import { format, formatDistanceToNow } from 'date-fns';

// Format date to readable string
export const formatDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password) => {
  return password.length >= 6;
};

// Format number for display (e.g., 1000 -> 1K)
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Create URL-friendly slug from text
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim(); // Trim - from start and end
};

// Debounce function for search inputs etc.
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Parse error messages from API responses
export const parseError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Something went wrong';
};

// Check if image URL is valid
export const isValidImageUrl = async (url) => {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    return contentType.startsWith('image/');
  } catch {
    return false;
  }
};

// Get initials from name
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
