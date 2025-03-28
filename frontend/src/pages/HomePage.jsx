import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  getPosts,
  incrementPage,
  resetPage,
  setFilter,
} from '../features/posts/postSlice';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/posts/PostSkeleton';
import CenteredLoader from '../components/common/CenteredLoader';

const HomePage = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, hasMore, page, filter } = useSelector((state) => state.posts);
  const observer = useRef();

  // Reset and fetch posts when filter changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        await dispatch(resetPage());
        await dispatch(getPosts({ page: 1, filter })).unwrap();
      } catch (error) {
        toast.error(error || 'Failed to load posts');
      }
    };
    fetchPosts();
  }, [dispatch, filter]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      await dispatch(getPosts({ page, filter })).unwrap();
    } catch (error) {
      toast.error(error || 'Failed to load more posts');
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, page, filter, hasMore, isLoadingMore]);

  // Infinite scroll setup
  const lastPostRef = useCallback(
    (node) => {
      if (isLoading || !hasMore || isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          await dispatch(incrementPage());
          await loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, dispatch, loadMorePosts, isLoadingMore]
  );

  // Reset filter state and posts
  const handleFilterChange = async (newFilter) => {
    if (isLoading || filter === newFilter) return;
    try {
      await dispatch(resetPage());
      await dispatch(setFilter(newFilter));
      const response = await dispatch(getPosts({ page: 1, filter: newFilter })).unwrap();
      if (response.posts.length === 0) {
        toast.info(newFilter === 'following' ? 'Follow users to see their posts' : 'No posts available');
      }
    } catch (error) {
      toast.error('Failed to update filter');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Post filtering options */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feed</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange('all')}
            disabled={isLoading}
            className={`btn-secondary ${filter === 'all' ? 'bg-blue-500 text-white' : ''}`}
          >
            All Posts
          </button>
          <button
            onClick={() => handleFilterChange('following')}
            disabled={isLoading}
            className={`btn-secondary ${filter === 'following' ? 'bg-blue-500 text-white' : ''}`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Posts list */}
      <div className="space-y-6">
        {/* Posts */}
        {posts.map((post, index) => (
          <div
            key={post._id}
            ref={index === posts.length - 1 ? lastPostRef : null}
            className="animate-fadeIn"
          >
            <PostCard 
              post={post}
            />
          </div>
        ))}

        {/* Initial loading */}
        {isLoading && posts.length === 0 && <CenteredLoader />}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="py-4 text-center">
            <CenteredLoader />
          </div>
        )}

        {/* No posts state */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              No posts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Follow some users to see their posts in your feed
            </p>
          </div>
        )}

        {/* End of posts indicator */}
        {!isLoading && !hasMore && posts.length > 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            You've reached the end
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
