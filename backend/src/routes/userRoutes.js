const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  toggleSavePost,
  getSavedPosts,
  deleteAccount,
  getProfile,
  getUserPosts,
  getUserStats
} = require('../controllers/userController');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

  // Profile and saved posts routes (must come first)
  router.route('/profile')
    .get(auth, getProfile)
    .put(auth, upload.single('profilePic'), updateProfile)
    .delete(auth, deleteAccount);

  router.get('/stats', auth, getUserStats);
  router.get('/saved/posts', auth, getSavedPosts);
  router.post('/posts/:postId/save', auth, toggleSavePost);
  router.get('/posts', auth, getUserPosts);

  // Follow/Unfollow routes
  router.post('/follow/:userId', auth, followUser);
  router.post('/unfollow/:userId', auth, unfollowUser);

  // User specific routes (should come last)
  router.get('/:userId', auth, getProfile);
  router.get('/:userId/profile', auth, getProfile);
  router.get('/:userId/posts', auth, getUserPosts);
  router.get('/:userId/followers', auth, getFollowers);
  router.get('/:userId/following', auth, getFollowing);

module.exports = router;
