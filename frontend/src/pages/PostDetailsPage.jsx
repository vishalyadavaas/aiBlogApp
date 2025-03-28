import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageSquare, FiArrowLeft, FiTrash2, FiEdit, FiSend } from 'react-icons/fi';
import { MdBookmark, MdBookmarkBorder, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import PostEditor from '../components/posts/PostEditor';
import { posts } from '../utils/api';
import CenteredLoader from '../components/common/CenteredLoader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { getPostById, toggleSavePost, toggleLike } from '../features/posts/postSlice';

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
  const [editedPost, setEditedPost] = useState(null);
  const [localPost, setLocalPost] = useState(null);

  // Load the post and keep track of local state
  useEffect(() => {
    dispatch(getPostById(id));
  }, [dispatch, id]);

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
      
      // Optimistic update
      const wasSaved = localPost.isUserSaved;
      setLocalPost(prev => ({
        ...prev,
        isUserSaved: !prev.isUserSaved
      }));
      
      // API call
      const { savedPosts } = await dispatch(toggleSavePost(id)).unwrap();
      
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
      
      // Optimistic update
      const isCurrentlyLiked = localPost.likes?.includes(user._id);
      setLocalPost(prev => ({
        ...prev,
        likes: isCurrentlyLiked 
          ? prev.likes.filter(id => id !== user._id)
          : [...prev.likes, user._id]
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

  const isLiked = localPost.likes?.includes(user?._id);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to="/" className="flex items-center text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white">
        <FiArrowLeft className="mr-2" />
        Back to feed
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
        <div 
          className="prose dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: localPost.content }}
        />
      )}

      <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4">
        <div className="flex items-center space-x-6">
          {localPost.userId?._id === user?._id && (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
                disabled={isSubmitting}
              >
                <FiEdit className="w-5 h-5" />
                <span>{editing ? 'Cancel Edit' : 'Edit Post'}</span>
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
                className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <FiTrash2 className="w-5 h-5" />
                <span>Delete Post</span>
              </button>
            </>
          )}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center space-x-2"
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
                <span className={isLiked ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}>
                  {localPost.likes?.length || 0}
                </span>
              </>
            )}
          </button>
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <FiMessageSquare />
            <span>{localPost.comments?.length || 0}</span>
          </div>
        </div>
        {user && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : localPost.isUserSaved ? (
              <MdBookmark className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            ) : (
              <MdBookmarkBorder className="w-6 h-6" />
            )}
          </button>
        )}
      </div>

      <div className="mt-8 border-t dark:border-gray-700 pt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Comments ({localPost.comments?.length || 0})
        </h3>
        
        {user && (
          <div className="flex gap-4 mb-6">
            <img
              src={user.profilePic || 'https://via.placeholder.com/40'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
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

        <div className="space-y-4">
          {localPost.comments?.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Link to={`/profile/${comment.userId?._id}`}>
                <img
                  src={comment.userId?.profilePic || 'https://via.placeholder.com/40'}
                  alt={comment.userId?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <Link
                      to={`/profile/${comment.userId?._id}`}
                      className="font-medium text-gray-900 dark:text-white hover:underline"
                    >
                      {comment.userId?.name}
                    </Link>
                    {(comment.userId?._id === user?._id) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-600 p-1"
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
                  <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {(localPost.comments?.length === 0) && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;
