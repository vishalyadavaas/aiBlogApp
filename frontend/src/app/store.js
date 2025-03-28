import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postReducer from '../features/posts/postSlice';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable date objects in action payloads
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
      },
    }),
});

export default store;
