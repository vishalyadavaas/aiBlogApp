const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, tags, aiGenerated } = req.body;
    
    const post = await Post.create({
      title,
      content,
      tags: tags || [],
      userId: req.user._id,
      aiGenerated: aiGenerated || false
    });

    // Populate user info for the response
    await post.populate('userId', 'name profilePic');

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating post',
      error: error.message
    });
  }
};

// @desc    Get all posts with pagination
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || 'all';

    let query = {};
    
    // Handle filtering based on authentication and filter type
    if (req.user && filter === 'following') {
      const currentUser = await User.findById(req.user._id)
        .select('following')
        .lean();

      // If not following anyone, return empty posts
      if (!currentUser?.following?.length) {
        return res.json({
          posts: [],
          currentPage: page,
          totalPages: 0,
          totalPosts: 0,
          hasMore: false
        });
      }

      // Filter to show only posts from followed users
      query = { userId: { $in: currentUser.following } };
    }

    // For 'all' filter or unauthenticated users, query remains empty to show all posts

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name profilePic')
      .populate('comments.userId', 'name profilePic')
      .populate('likes', 'name');

    // Get current user's saved posts
    let savedPosts = [];
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      savedPosts = currentUser.savedPosts || [];
    }

    // Add isUserSaved field to posts
    const postsWithSaveStatus = posts.map(post => ({
      ...post.toObject(),
      isUserSaved: savedPosts.includes(post._id)
    }));

    // Count total posts based on the current query
    const total = await Post.countDocuments(query);

    res.json({
      posts: postsWithSaveStatus,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasMore: (page * limit) < total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching posts',
      error: error.message
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name profilePic')
      .populate('comments.userId', 'name profilePic')
      .populate('likes', 'name profilePic');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add saved status if user is authenticated
    let postWithSaveStatus = post.toObject();
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      postWithSaveStatus.isUserSaved = currentUser.savedPosts?.includes(post._id) || false;
    }

    res.json(postWithSaveStatus);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching post',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, tags } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;

    const updatedPost = await post.save();
    await updatedPost.populate('userId', 'name profilePic');
    await updatedPost.populate('comments.userId', 'name profilePic');
    await updatedPost.populate('likes', 'name');
    
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating post',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting post',
      error: error.message
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      // Like post
      post.likes.push(req.user._id);
      
    } else {
      // Unlike post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    // Get updated save status
    const currentUser = await User.findById(req.user._id);
    const responsePost = post.toObject();
    responsePost.isUserSaved = currentUser.savedPosts?.includes(post._id) || false;

    await post.populate('userId', 'name profilePic');
    await post.populate('comments.userId', 'name profilePic');
    await post.populate('likes', 'name');

    res.json(post);
  } catch (error) {
    res.status(400).json({
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      text,
      userId: req.user._id
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('userId', 'name profilePic');
    await post.populate('comments.userId', 'name profilePic');
    await post.populate('likes', 'name');

    res.json(post);
  } catch (error) {
    res.status(400).json({
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString() && 
        post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();
    await post.populate('userId', 'name profilePic');
    await post.populate('comments.userId', 'name profilePic');
    await post.populate('likes', 'name');

    res.json(post);
  } catch (error) {
    res.status(400).json({
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
};
