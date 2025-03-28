import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMessageSquare, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { MdFavorite, MdFavoriteBorder, MdBookmark, MdBookmarkBorder } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import { posts } from '../../utils/api';
import { toggleLike, resetPage, getPosts, toggleSavePost } from '../../features/posts/postSlice';
import { followUserThunk, unfollowUserThunk } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const PostCard = ({ post, onPostUpdated, isProfilePage, onSaveToggle }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { user } = useSelector(state => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  const [postState, setPostState] = useState(post);
  const { filter } = useSelector(state => state.posts);
  const dispatch = useDispatch();
  
  // Sync local state with prop changes
  useEffect(() => {
    setPostState(post);
    console.log('Post State:', post);
    console.log('Author ID:', post.userId?._id);
  }, [post]);
  
  // Determine if post is liked by current user
  const isLiked = user && postState.likes?.includes(user._id);
  
  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      setIsLiking(true);
      
      // Optimistic update for better UX
      const wasLiked = isLiked;
      setPostState(prev => ({
        ...prev,
        likes: wasLiked 
          ? prev.likes.filter(id => id !== user._id)
          : [...prev.likes, user._id]
      }));
      
      // Make API call
      const response = await dispatch(toggleLike(postState._id)).unwrap();
      
      // Update with server data
      setPostState(response);
      
      // Notify parent component if needed
      if (onPostUpdated) {
        onPostUpdated();
      }
      
    } catch (error) {
      // Revert optimistic update on error
      toast.error('Failed to like post');
      setPostState(post);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleSavePost = async () => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Store current save state
      const wasSaved = postState.isUserSaved;
      
      // Optimistic update
      setPostState(prev => ({
        ...prev,
        isUserSaved: !prev.isUserSaved
      }));
      
      // Make API call
      const { savedPosts } = await dispatch(toggleSavePost(postState._id)).unwrap();
      
      // Update post state based on server response
      setPostState(prev => ({
        ...prev,
        isUserSaved: savedPosts.includes(postState._id)
      }));
      
      toast.success(wasSaved ? 'Post unsaved' : 'Post saved');
      
      // Notify parent about post update if needed
      if (onPostUpdated) {
        onPostUpdated();
      }
      
      // If unsaving and we have a save toggle callback (on profile page), call it
      if (wasSaved && onSaveToggle) {
        onSaveToggle();
      }
      
    } catch (error) {
      // Revert optimistic update on error
      toast.error('Failed to save post');
      setPostState(post);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card p-6 mb-4 animate-fade-in">
      {/* Author info */}
      <div className="flex items-center justify-between mb-4">
        {postState.userId ? (
          <>
            <div className="flex items-center">
              <Link to={`/profile/${postState.userId._id}`}>
                <img
                  src={postState.userId.profilePic || 'https://via.placeholder.com/40'}
                  alt={postState.userId.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div className="ml-3">
                <Link
                  to={`/profile/${postState.userId._id}`}
                  className="font-medium text-gray-900 dark:text-white hover:underline"
                >
                  {postState.userId.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(postState.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <img
              src="https://via.placeholder.com/40"
              alt="Anonymous"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900 dark:text-white">
                Anonymous
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(postState.createdAt), { addSuffix: true })}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Post title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {postState.title}
      </h3>

      {/* Post content */}
      <div className="mb-4">
        <div 
          className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-2 prose dark:prose-invert"
          dangerouslySetInnerHTML={{ 
            __html: postState.content.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
          }}
        />
        <Link 
          to={`/post/${postState._id}`}
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Read more
        </Link>
      </div>

      {/* Post image if exists */}
      {postState.image && (
        <img
          src={postState.image}
          alt="Post"
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      {/* Interaction buttons */}
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center space-x-2 transform transition-all duration-200"
          >
            {isLiking ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  {isLiked ? (
                    <MdFavorite className="w-6 h-6 text-red-500 dark:text-red-400" />
                  ) : (
                    <MdFavoriteBorder className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                  )}
                </div>
                <span className={`transition-all duration-200 ${
                  isLiked ? 'text-red-500 dark:text-red-400' : ''
                }`}>
                  {postState.likes?.length || 0}
                </span>
              </>
            )}
          </button>
          <Link 
            to={`/post/${postState._id}`}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <FiMessageSquare />
            <span>{postState.comments?.length || 0}</span>
          </Link>
          {user && (
            <button
              onClick={handleSavePost}
              disabled={isSaving}
              className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : postState.isUserSaved ? (
                <MdBookmark className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              ) : (
                <MdBookmarkBorder className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
