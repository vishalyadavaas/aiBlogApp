import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMessageSquare, FiUserPlus, FiUserCheck, FiShare2, FiEye, FiClock, FiArrowRight } from 'react-icons/fi';
import { MdFavorite, MdFavoriteBorder, MdBookmark, MdBookmarkBorder } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import { posts } from '../../utils/api';
import { toggleLike, resetPage, getPosts, toggleSavePost } from '../../features/posts/postSlice';
import { followUserThunk, unfollowUserThunk } from '../../features/auth/authSlice';
import { updateSavedPosts, getCurrentUser } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const PostCard = ({ post, onPostUpdated, isProfilePage, onSaveToggle }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { user } = useSelector(state => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  const [localState, setLocalState] = useState(post);
  const [localLikes, setLocalLikes] = useState(post.likes || []);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { filter } = useSelector(state => state.posts);
  const dispatch = useDispatch();
  
  useEffect(() => {
    setLocalState(post);
    if (Array.isArray(post.likes)) {
      setLocalLikes(post.likes);
    } else {
      setLocalLikes([]);
    }
  }, [post]);
  
  const isLiked = Boolean(
    user && localLikes.some(like => 
      like?.toString() === user._id || like?._id === user._id
    )
  );

  const isFollowing = Boolean(
    user && localState.userId && user._id !== localState.userId._id && (
      user.following?.includes(localState.userId._id) ||
      user.following?.some(f => f === localState.userId._id || f._id === localState.userId._id)
    )
  );
  
  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      setIsLiking(true);
      
      const optimisticLikes = isLiked 
        ? localLikes.filter(like => like?.toString() !== user._id && like?._id !== user._id)
        : [...localLikes, user._id];
      
      setLocalLikes(optimisticLikes);
      
      await posts.likePost(localState._id);
      
      if (onPostUpdated) {
        onPostUpdated();
      }
      
      await dispatch(getPosts({ page: 1, filter }));
      
    } catch (error) {
      setLocalLikes(post.likes || []);
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like');
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
      
      // Make API call using Redux action
      const { savedPosts } = await dispatch(toggleSavePost(localState._id)).unwrap();
      
      // Update auth state with saved posts
      dispatch(updateSavedPosts(savedPosts));
      
      // Also refresh user data to ensure sync
      dispatch(getCurrentUser());
      
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
      setLocalState(prev => ({ ...prev, isUserSaved: !prev.isUserSaved }));
      console.error('Failed to toggle save:', error);
      toast.error('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollowUser = async () => {
    if (!user || !localState.userId) {
      toast.error('Please login to follow users');
      return;
    }

    if (localState.userId._id === user._id) {
      toast.error("You can't follow yourself");
      return;
    }

    try {
      setIsFollowLoading(true);
      
      if (isFollowing) {
        await dispatch(unfollowUserThunk(localState.userId._id)).unwrap();
        toast.success(`Unfollowed ${localState.userId.name}`);
      } else {
        await dispatch(followUserThunk(localState.userId._id)).unwrap();
        toast.success(`Now following ${localState.userId.name}`);
      }
      
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${localState._id}`;
    const shareData = {
      title: localState.title,
      text: localState.content?.substring(0, 100) + '...',
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Post shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <article className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transform hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col">
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating orbs for visual appeal */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header with author info */}
        <div className="flex items-center justify-between mb-4">
          {localState.userId ? (
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Link to={`/profile/${localState.userId._id}`} className="group/avatar flex-shrink-0">
                <div className="relative">
                  <img
                    src={localState.userId.profilePic || 'https://via.placeholder.com/40'}
                    alt={localState.userId.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/80 dark:border-gray-600/80 shadow-lg group-hover/avatar:border-blue-400 transition-all duration-300 group-hover/avatar:scale-110"
                  />
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Link
                    to={`/profile/${localState.userId._id}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 truncate"
                  >
                    {localState.userId.name}
                  </Link>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <time>{formatDistanceToNow(new Date(localState.createdAt), { addSuffix: true })}</time>
                  <span>•</span>
                  <span>{getReadingTime(localState.content)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          )}
          
          {/* Save button */}
          <button
            onClick={handleSavePost}
            disabled={isSaving}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              localState.isUserSaved
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            }`}
            title={localState.isUserSaved ? 'Saved' : 'Save'}
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : localState.isUserSaved ? (
              <MdBookmark className="w-4 h-4" />
            ) : (
              <MdBookmarkBorder className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title with modern typography */}
        <Link to={`/post/${localState._id}`} className="block group/title mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover/title:bg-gradient-to-r group-hover/title:from-blue-600 group-hover/title:via-purple-600 group-hover/title:to-pink-600 group-hover/title:bg-clip-text group-hover/title:text-transparent transition-all duration-300 leading-tight line-clamp-2">
            {localState.title}
          </h2>
        </Link>

        {/* Enhanced Content preview with more description */}
        <div className="mb-4 flex-1">
          <div 
            className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4"
            dangerouslySetInnerHTML={{ 
              __html: localState.content?.replace(/<[^>]*>/g, '').replace(/#{1,6}\s*/g, '').substring(0, 250) + (localState.content?.length > 250 ? '...' : '') 
            }} 
          />
        </div>

        {/* Tags with modern pill design */}
        {localState.tags && localState.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {localState.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-shadow duration-200"
              >
                #{tag}
              </span>
            ))}
            {localState.tags.length > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{localState.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action buttons with modern design */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                isLiked 
                  ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' 
                  : 'text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiking ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {isLiked ? (
                    <MdFavorite className="w-4 h-4" />
                  ) : (
                    <MdFavoriteBorder className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{localLikes?.length || 0}</span>
                </>
              )}
            </button>

            {/* Comment button */}
            <Link 
              to={`/post/${localState._id}`}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
              title="Comments"
            >
              <FiMessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">{localState.comments?.length || 0}</span>
            </Link>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-gray-500 hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-105"
              title="Share"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>

          {/* Read more button */}
          <Link
            to={`/post/${localState._id}`}
            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>Read</span>
            <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
