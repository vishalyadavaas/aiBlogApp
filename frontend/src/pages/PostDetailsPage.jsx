import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageSquare, FiArrowLeft, FiTrash2, FiEdit, FiSend, FiClock } from 'react-icons/fi';
import { MdBookmark, MdBookmarkBorder, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import PostEditor from '../components/posts/PostEditor';
import MarkdownResponse from '../components/common/MarkdownResponse';
import { posts } from '../utils/api';
import CenteredLoader from '../components/common/CenteredLoader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { getPostById, toggleSavePost, toggleLike } from '../features/posts/postSlice';
import { updateSavedPosts, getCurrentUser } from '../features/auth/authSlice';

const PostDetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  
  const { user } = useSelector(state => state.auth);
  const { currentPost: post, isLoading: loading } = useSelector(state => state.posts);
  const { mode: themeMode } = useSelector(state => state.theme) || { mode: 'light' };
  const [editedPost, setEditedPost] = useState(null);
  const [localPost, setLocalPost] = useState(null);

  // Load the post and keep track of local state
  useEffect(() => {
    dispatch(getPostById(id));
    // Refresh user data to get latest savedPosts
    if (user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, id, user?._id]);

  // Sync local state with Redux changes
  useEffect(() => {
    if (post) {
      setLocalPost(post);
    }
  }, [post]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;

    try {
      setIsAddingComment(true);
      await posts.commentPost(id, commentText);
      dispatch(getPostById(id)); // Refresh post data
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setIsDeletingComment(true);
      await posts.deleteComment(id, commentId);
      dispatch(getPostById(id)); // Refresh post data
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleUpdate = async () => {
    if (!editedPost) return;
    try {
      setIsSubmitting(true);
      await posts.update(id, editedPost);
      dispatch(getPostById(id)); // Refresh post data
      setEditing(false);
      setEditedPost(null);
      toast.success('Post updated successfully');
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (editing && editedPost) {
      if (
        editedPost.title !== post.title || 
        editedPost.content !== post.content
      ) {
        if (!window.confirm('Discard changes?')) {
          return;
        }
      }
    }
    setEditing(!editing);
    setEditedPost(editing ? null : { ...post });
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Optimistic update using robust check
      const wasSaved = isPostSaved;
      setLocalPost(prev => ({
        ...prev,
        isUserSaved: !wasSaved
      }));
      
      // API call
      const { savedPosts } = await dispatch(toggleSavePost(id)).unwrap();
      
      // Update auth state with saved posts
      dispatch(updateSavedPosts(savedPosts));
      
      // Also refresh user data to ensure sync
      dispatch(getCurrentUser());
      
      // Update with server state
      setLocalPost(prev => ({
        ...prev,
        isUserSaved: savedPosts.includes(id)
      }));
      
      toast.success(wasSaved ? 'Post unsaved' : 'Post saved');
    } catch (error) {
      toast.error('Failed to save post');
      // Revert on error
      setLocalPost(post);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      setIsLiking(true);
      
      // Optimistic update using robust like checking
      const isCurrentlyLiked = localPost.likes && localPost.likes.some(like => 
        like?.toString() === user._id || like?._id === user._id
      );
      
      const optimisticLikes = isCurrentlyLiked 
        ? localPost.likes.filter(like => like?.toString() !== user._id && like?._id !== user._id)
        : [...(localPost.likes || []), user._id];
      
      setLocalPost(prev => ({
        ...prev,
        likes: optimisticLikes
      }));
      
      // API call
      const updatedPost = await dispatch(toggleLike(id)).unwrap();
      
      // Update with server state
      setLocalPost(updatedPost);
    } catch (error) {
      toast.error('Failed to like post');
      // Revert on error
      setLocalPost(post);
    } finally {
      setIsLiking(false);
    }
  };

  if (loading || !localPost) {
    return <CenteredLoader />;
  }

  if (!localPost) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post not found</h2>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  const isLiked = Boolean(
    user && localPost.likes && localPost.likes.some(like => 
      like?.toString() === user._id || like?._id === user._id
    )
  );

  // Robust save state check - check both localPost.isUserSaved and user's savedPosts array
  const isPostSaved = Boolean(
    user && localPost && (
      localPost.isUserSaved || 
      (user.savedPosts && user.savedPosts.some(savedPostId => 
        savedPostId?.toString() === localPost._id || savedPostId?._id === localPost._id
      ))
    )
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      themeMode === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-white'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <Link to="/" className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg mb-8 transition-all duration-300 ${
          themeMode === 'dark'
            ? 'text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600'
            : 'text-gray-600 hover:text-gray-900 bg-white/50 hover:bg-white border border-gray-200 hover:border-gray-300'
        } backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105`}>
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to feed</span>
        </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to={`/profile/${localPost.userId?._id}`}>
            <img
              src={localPost.userId?.profilePic || 'https://via.placeholder.com/40'}
              alt={localPost.userId?.name || 'Anonymous'}
              className="w-12 h-12 rounded-full object-cover"
            />
          </Link>
          <div className="ml-4">
            <Link
              to={`/profile/${localPost.userId?._id}`}
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              {localPost.userId?.name || 'Anonymous'}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {localPost.title}
      </h1>

      {localPost.image && (
        <img
          src={localPost.image}
          alt="Post"
          className="w-full max-h-96 object-cover rounded-lg mb-6"
        />
      )}

      {editing ? (
        <div>
          <PostEditor
            title={editedPost.title}
            content={editedPost.content}
            onTitleChange={(title) => setEditedPost({ ...editedPost, title })}
            onContentChange={(content) => setEditedPost({ ...editedPost, content })}
            isSubmitting={isSubmitting}
          />
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 w-full">
          <MarkdownResponse darkMode={themeMode === 'dark'} className="w-full !max-w-none overflow-hidden">
            {localPost.content}
          </MarkdownResponse>
        </div>
      )}

      <div className={`flex items-center justify-between border-t-2 pt-6 mt-8 ${
        themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-4">
          {localPost.userId?._id === user?._id && (
            <>
              <button
                onClick={handleEdit}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  themeMode === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                } transform hover:scale-105 disabled:opacity-50`}
                disabled={isSubmitting}
              >
                <FiEdit className="w-4 h-4" />
                <span className="font-medium">{editing ? 'Cancel Edit' : 'Edit Post'}</span>
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this post?')) {
                    try {
                      await posts.delete(localPost._id);
                      toast.success('Post deleted successfully');
                      navigate('/');
                    } catch (error) {
                      toast.error('Failed to delete post');
                    }
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  themeMode === 'dark'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                } transform hover:scale-105`}
              >
                <FiTrash2 className="w-4 h-4" />
                <span className="font-medium">Delete Post</span>
              </button>
            </>
          )}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isLiked
                ? themeMode === 'dark'
                  ? 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 shadow-lg shadow-red-500/10'
                  : 'bg-red-50 hover:bg-red-100 border border-red-200 shadow-lg shadow-red-500/10'
                : themeMode === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            } transform hover:scale-105`}
          >
            {isLiking ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  {isLiked ? (
                    <MdFavorite className="w-6 h-6" style={{ color: '#ef4444' }} />
                  ) : (
                    <MdFavoriteBorder className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                  )}
                </div>
                <span className={isLiked ? "font-medium" : "text-gray-500 dark:text-gray-400"} style={isLiked ? { color: '#ef4444' } : {}}>
                  {localPost.likes?.length || 0}
                </span>
              </>
            )}
          </button>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            themeMode === 'dark'
              ? 'bg-gray-700/50 text-gray-300 border border-gray-600/50'
              : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}>
            <FiMessageSquare className="w-6 h-6" />
            <span className="font-medium">{localPost.comments?.length || 0}</span>
          </div>
        </div>
        {user && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isPostSaved
                ? themeMode === 'dark'
                  ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                  : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border border-yellow-200 shadow-lg shadow-yellow-500/10'
                : themeMode === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            } transform hover:scale-105`}
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  {isPostSaved ? (
                    <MdBookmark className="w-6 h-6" style={{ color: '#eab308' }} />
                  ) : (
                    <MdBookmarkBorder className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors" />
                  )}
                </div>
                <span className={isPostSaved ? "font-medium" : "text-gray-500 dark:text-gray-400"} style={isPostSaved ? { color: '#eab308' } : {}}>
                  {isPostSaved ? 'Saved' : 'Save'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <div className={`mt-8 border-t pt-6 ${
        themeMode === 'dark' 
          ? 'border-gray-700' 
          : 'border-gray-200'
      }`}>
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center space-x-2">
          <FiMessageSquare className="w-5 h-5 text-blue-500" />
          <span>Comments ({localPost.comments?.length || 0})</span>
        </h3>
        
        {user && (
          <div className={`flex gap-4 mb-6 p-4 rounded-xl transition-all duration-300 ${
            themeMode === 'dark'
              ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm'
          }`}>
            <img
              src={user.profilePic || 'https://via.placeholder.com/40'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Write a thoughtful comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    themeMode === 'dark'
                      ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 backdrop-blur-sm'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isAddingComment}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                    commentText.trim()
                      ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAddingComment ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {localPost.comments?.map((comment) => (
            <div key={comment._id} className={`flex gap-4 group`}>
              <Link to={`/profile/${comment.userId?._id}`} className="flex-shrink-0">
                <img
                  src={comment.userId?.profilePic || 'https://via.placeholder.com/40'}
                  alt={comment.userId?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500/30 transition-all duration-300"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm'
                    : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm'
                } group-hover:shadow-md group-hover:border-blue-500/20`}>
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      to={`/profile/${comment.userId?._id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
                    >
                      {comment.userId?.name}
                    </Link>
                    {(comment.userId?._id === user?._id) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-all duration-300"
                        disabled={isDeletingComment}
                      >
                        {isDeletingComment ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <FiTrash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-2">{comment.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <FiClock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {(localPost.comments?.length === 0) && (
            <div className={`text-center py-8 rounded-xl ${
              themeMode === 'dark'
                ? 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/30'
                : 'bg-gradient-to-br from-gray-50/50 to-white/50 border border-gray-200/50'
            }`}>
              <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No comments yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;
