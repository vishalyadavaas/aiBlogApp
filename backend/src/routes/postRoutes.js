const express = require('express');
const router = express.Router();
const { auth, requireAuth } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} = require('../controllers/postController');

router.route('/')
  .post(requireAuth, createPost)
  .get(auth, getPosts);  // Optional auth for filtering

router.route('/:id')
  .get(getPostById)
  .put(requireAuth, updatePost)
  .delete(requireAuth, deletePost);

// Like routes
router.post('/:id/like', requireAuth, toggleLike);

// Comment routes
router.route('/:id/comment')
  .post(requireAuth, addComment);

router.route('/:id/comment/:commentId')
  .delete(requireAuth, deleteComment);

module.exports = router;
