import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { posts } from '../../utils/api';
import { generateContent } from '../../utils/aiHelpers';

// Generate post content using AI
export const generatePostContent = createAsyncThunk(
  'posts/generateContent',
  async ({ prompt, options = {} }, thunkAPI) => {
    try {
      console.log('Generating content with prompt:', prompt);
      const generated = await generateContent(prompt, options);
      console.log('Content generated successfully:', generated);
      return generated;
    } catch (error) {
      console.error('Error generating content:', error);
      const message = error.message || 'Failed to generate content';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  isGenerating: false,
  generationError: null,
  generatedContent: null,
  hasMore: true,
  filter: 'all'
};

// Posts actions
export const fetchPostsStart = () => ({ type: 'posts/fetchPostsStart' });
export const fetchPostsSuccess = (data) => ({ type: 'posts/fetchPostsSuccess', payload: data });
export const fetchPostsFail = (error) => ({ type: 'posts/fetchPostsFail', payload: error });
export const incrementPage = () => ({ type: 'posts/incrementPage' });
export const resetPage = () => ({ type: 'posts/resetPage' });
export const setFilter = (filter) => ({ type: 'posts/setFilter', payload: filter });

// Create post
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, thunkAPI) => {
    try {
      const response = await posts.create(postData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all posts
export const getPosts = createAsyncThunk(
  'posts/getAll',
  async ({ page = 1, limit = 10, filter = 'all' }, thunkAPI) => {
    try {
      const response = await posts.getAll(page, limit, filter);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single post
export const getPostById = createAsyncThunk(
  'posts/getById',
  async (id, thunkAPI) => {
    try {
      const response = await posts.getById(id);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update post
export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ id, postData }, thunkAPI) => {
    try {
      const response = await posts.update(id, postData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id, thunkAPI) => {
    try {
      await posts.delete(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Save/unsave post
export const toggleSavePost = createAsyncThunk(
  'posts/toggleSave',
  async (postId, thunkAPI) => {
    try {
      const response = await posts.toggleSavePost(postId);
      return { postId, savedPosts: response.data.savedPosts };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Like/Unlike post
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (id, thunkAPI) => {
    try {
      const response = await posts.likePost(id);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add comment
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }, thunkAPI) => {
    try {
      const response = await posts.commentPost(postId, text);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, thunkAPI) => {
    try {
      const response = await posts.deleteComment(postId, commentId);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPostState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.currentPost = null;
    },
    clearGenerationState: (state) => {
      state.isGenerating = false;
      state.generationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate content
      .addCase(generatePostContent.pending, (state) => {
        state.isGenerating = true;
        state.generationError = null;
        state.generatedContent = null;
      })
      .addCase(generatePostContent.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedContent = action.payload;
      })
      .addCase(generatePostContent.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationError = action.payload;
      })
      // Get posts
      .addCase(getPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = state.page === 1 
          ? action.payload.posts 
          : [...state.posts, ...action.payload.posts];
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
            // Other cases...
      .addCase('posts/incrementPage', (state) => {
        state.page += 1;
      })
      .addCase('posts/resetPage', (state) => {
        state.page = 1;
        state.posts = [];
        state.hasMore = true;
      })
      .addCase('posts/setFilter', (state, action) => {
        state.filter = action.payload;
        state.page = 1;
        state.posts = [];
        state.hasMore = true;
      })
      // Update like in all places
      .addCase(toggleLike.fulfilled, (state, action) => {
        const updatedPost = action.payload;

      // Update in posts list with the complete updated post data
      state.posts = state.posts.map(post => {
        if (post._id === updatedPost._id) {
          // Preserve populated userId data
          return {
            ...updatedPost,
            userId: post.userId // Keep the existing userId object with populated data
          };
        }
        return post;
      });

        // Update in current post if viewing details
        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = {
            ...state.currentPost,
            likes: updatedPost.likes
          };
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle get single post
      .addCase(getPostById.fulfilled, (state, action) => {
        state.currentPost = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      // Update saved posts state in all views
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        const { postId, savedPosts } = action.payload;
        const isPostSaved = savedPosts.includes(postId);
        
        // Update in current post view
        if (state.currentPost?._id === postId) {
          state.currentPost = { ...state.currentPost, isUserSaved: isPostSaved };
        }
        
        // Update in all posts lists (main feed, profile posts, etc.)
        state.posts = state.posts.map(post => {
          if (post._id === postId) {
            return { ...post, isUserSaved: isPostSaved };
          }
          return post;
        });
      })
      // Handle errors
      .addCase(toggleSavePost.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetPostState, clearGenerationState } = postSlice.actions;
export default postSlice.reducer;
