const User = require('../models/User');
const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

// @desc    Get user profile (own or other's)
// @route   GET /api/users/profile or GET /api/users/:userId/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // For own profile
    if (!req.params.userId) {
      const user = await User.findById(req.user._id)
        .select('name email bio profilePic followers following')
        .populate('followers', 'name profilePic bio')
        .populate('following', 'name profilePic bio');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        followers: user.followers || [],
        following: user.following || [],
        isFollowing: false
      });
    }

    // For other user's profile
    const user = await User.findById(req.params.userId)
      .select('name email bio profilePic followers following')
      .populate('followers', 'name profilePic bio')
      .populate('following', 'name profilePic bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the requesting user follows this profile (only for other users' profiles)
    const isFollowing = req.params.userId && 
      req.params.userId !== req.user._id.toString() &&
      user.followers.some(f => f._id.toString() === req.user._id.toString());

    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      followers: user.followers || [],
      following: user.following || [],
      isFollowing: !!isFollowing
    };

    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio } = req.body;
    
    user.name = name || user.name;
    user.bio = bio || user.bio;

    if (req.file) {
      try {
        
        // Check if file exists
        try {
          await fs.access(req.file.path);
        } catch (err) {
          console.error('File access error:', err);
          return res.status(500).json({
            message: 'Upload file not found',
            error: err.message
          });
        }

        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profiles',
          width: 500,
          crop: "scale"
        });


        try {
          // Delete local file after upload
          await fs.unlink(req.file.path);
        } catch (err) {
          console.error('Error deleting local file:', err);
          // Don't return here, continue with the update
        }

        // Store cloudinary URL
        user.profilePic = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({
          message: 'Error uploading profile picture',
          error: error.message
        });
      }
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Follow user
// @route   POST /api/users/follow/:userId
// @access  Private
const followUser = async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.following.some(id => id.toString() === userToFollow._id.toString())) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await Promise.all([currentUser.save(), userToFollow.save()]);

    const updatedProfile = await User.findById(req.params.userId)
      .select('name email bio profilePic followers following')
      .populate('followers', 'name profilePic bio')
      .populate('following', 'name profilePic bio');

    res.json({
      message: 'Successfully followed user',
      following: currentUser.following,
      followers: updatedProfile.followers,
      profile: {
        _id: updatedProfile._id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        bio: updatedProfile.bio,
        profilePic: updatedProfile.profilePic,
        followers: updatedProfile.followers,
        following: updatedProfile.following,
        isFollowing: true
      }
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error following user',
      error: error.message
    });
  }
};

// @desc    Unfollow user
// @route   POST /api/users/unfollow/:userId
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.following.some(id => id.toString() === userToUnfollow._id.toString())) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    const updatedProfile = await User.findById(req.params.userId)
      .select('name email bio profilePic followers following')
      .populate('followers', 'name profilePic bio')
      .populate('following', 'name profilePic bio');

    res.json({
      message: 'Successfully unfollowed user',
      following: currentUser.following,
      followers: updatedProfile.followers,
      profile: {
        _id: updatedProfile._id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        bio: updatedProfile.bio,
        profilePic: updatedProfile.profilePic,
        followers: updatedProfile.followers,
        following: updatedProfile.following,
        isFollowing: false
      }
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error unfollowing user',
      error: error.message
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:userId/followers
// @access  Private
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'name email profilePic bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching followers',
      error: error.message
    });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:userId/following
// @access  Private
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'name email profilePic bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching following',
      error: error.message
    });
  }
};

// @desc    Save/unsave post
// @route   POST /api/users/posts/:postId/save
// @access  Private
const toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const savedPostIndex = user.savedPosts.indexOf(post._id);
    
    if (savedPostIndex === -1) {
      // Save post
      user.savedPosts.push(post._id);
    } else {
      // Unsave post
      user.savedPosts.splice(savedPostIndex, 1);
    }

    await user.save();
    res.json({ 
      message: savedPostIndex === -1 ? 'Post saved' : 'Post unsaved',
      savedPosts: user.savedPosts 
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error toggling save post',
      error: error.message
    });
  }
};

// @desc    Get user's saved posts
// @route   GET /api/users/saved/posts
// @access  Private
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Populate the full post data along with the author info for each saved post
    const posts = await Post.find({ _id: { $in: user.savedPosts || [] } })
      .populate('userId', 'name email profilePic')
      .sort({ createdAt: -1 });

    const savedPosts = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isUserSaved: true,
        isLiked: post.likes?.includes(user._id) || false
      };
    });

    res.json({
      status: 'success',
      data: savedPosts
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching saved posts',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's posts
    await Post.deleteMany({ userId: user._id });

    // Delete user's comments from other posts
    await Post.updateMany(
      { 'comments.userId': user._id },
      { $pull: { comments: { userId: user._id } } }
    );

    // Delete user's likes from posts
    await Post.updateMany(
      { likes: user._id },
      { $pull: { likes: user._id } }
    );

    // Remove user from followers/following lists
    await User.updateMany(
      { $or: [{ followers: user._id }, { following: user._id }] },
      { 
        $pull: { 
          followers: user._id,
          following: user._id
        }
      }
    );

    // Finally delete the user
    await User.deleteOne({ _id: user._id });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting account',
      error: error.message
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/users/posts or GET /api/users/:userId/posts
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.user._id;
    const posts = await Post.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name profilePic');

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user posts',
      error: error.message
    });
  }
};

module.exports = {
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  toggleSavePost,
  getSavedPosts,
  deleteAccount,
  getProfile,
  getUserPosts
};
