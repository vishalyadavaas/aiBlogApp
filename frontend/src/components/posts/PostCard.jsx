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
  const [localState, setLocalState] = useState(post);
  const [localLikes, setLocalLikes] = useState(post.likes || []);
  const { filter } = useSelector(state => state.posts);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Always sync with the latest post data
    setLocalState(post);
    // Ensure likes is an array
    if (Array.isArray(post.likes)) {
      setLocalLikes(post.likes);
    } else {
      setLocalLikes([]);
    }
  }, [post]);
  
  // Determine if post is liked by current user
  // Determine if post is liked by current user by checking the likes array
  // The array may contain either user IDs (strings) or user objects
  const isLiked = Boolean(
    user && localLikes.some(like => 
      like?.toString() === user._id || like?._id === user._id
    )
  );
  
  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      setIsLiking(true);
      
      // Optimistic update
      setLocalLikes(prev => 
        isLiked 
          ? prev.filter(like => like?.toString() !== user._id && like?._id !== user._id)
          : [...prev, { _id: user._id }]  // Add as object to match populated format
      );
      
      // Make API call
      const response = await dispatch(toggleLike(localState._id)).unwrap();
      
      // Ensure we have the likes array from the response
      if (Array.isArray(response.likes)) {
        setLocalLikes(response.likes);
      }
      
      // Update local state with full response data
      setLocalState(response);
      
      // Only refresh the feed if specifically requested by parent
      if (onPostUpdated) {
        onPostUpdated();
      }
      
    } catch (error) {
      // Revert optimistic update on error
      toast.error('Failed to like post');
      setLocalLikes(post.likes || []);
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
      const wasSaved = localState.isUserSaved;
      
      // Optimistic update
      setLocalState(prev => ({
        ...prev,
        isUserSaved: !prev.isUserSaved
      }));
      
      // Make API call
      const { savedPosts } = await dispatch(toggleSavePost(localState._id)).unwrap();
      
      // Update local state based on server response
      setLocalState(prev => ({
        ...prev,
        isUserSaved: savedPosts.includes(localState._id)
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
      setLocalState(post);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card p-6 mb-4 animate-fade-in">
      {/* Author info */}
      <div className="flex items-center justify-between mb-4">
        {localState.userId ? (
          <>
            <div className="flex items-center">
              <Link to={`/profile/${localState.userId._id}`}>
                <img
                  src={localState.userId.profilePic || 'https://via.placeholder.com/40'}
                  alt={localState.userId.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div className="ml-3">
                <Link
                  to={`/profile/${localState.userId._id}`}
                  className="font-medium text-gray-900 dark:text-white hover:underline"
                >
                  {localState.userId.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(localState.createdAt), { addSuffix: true })}
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
                {formatDistanceToNow(new Date(localState.createdAt), { addSuffix: true })}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Post title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {localState.title}
      </h3>

      {/* Post content */}
      <div className="mb-4">
        <div 
          className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-2 prose dark:prose-invert"
          dangerouslySetInnerHTML={{ 
            __html: localState.content.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
          }}
        />
        <Link 
          to={`/post/${localState._id}`}
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Read more
        </Link>
      </div>

      {/* Post image if exists */}
      {localState.image && (
        <img
          src={localState.image}
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
            className="flex items-center space-x-2 transform transition-colors duration-200 ease-in-out"
          >
            {isLiking ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="transform transition-all duration-200 ease-in-out">
                    {isLiked ? (
                      <MdFavorite className="w-6 h-6 text-red-500 dark:text-red-400 animate-like" />
                    ) : (
                      <MdFavoriteBorder className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                    )}
                  </div>
                </div>
                <span className={`transition-all duration-200 ${
                  isLiked ? 'text-red-500 dark:text-red-400' : ''
                }`}>
                  {localLikes?.length || 0}
                </span>
              </>
            )}
          </button>
          <Link 
            to={`/post/${localState._id}`}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <FiMessageSquare />
            <span>{localState.comments?.length || 0}</span>
          </Link>
          {user && (
            <button
              onClick={handleSavePost}
              disabled={isSaving}
              className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : localState.isUserSaved ? (
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
