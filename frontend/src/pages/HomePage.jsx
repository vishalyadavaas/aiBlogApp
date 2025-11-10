import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiUsers, FiActivity, FiStar, FiSearch, FiPlusSquare } from 'react-icons/fi';
import {
  getPosts,
  incrementPage,
  resetPage,
  setFilter,
} from '../features/posts/postSlice';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/posts/PostSkeleton';
import CenteredLoader from '../components/common/CenteredLoader';
import { users } from '../utils/api';

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { posts, isLoading, hasMore, page, filter } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  const observer = useRef();
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch user stats
  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const response = await users.getStats();
          setUserStats(response.data);
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [user]);

  // Calculate real stats from API data
  const stats = userStats ? [
    { 
      icon: <FiActivity />, 
      label: 'Total Posts', 
      value: userStats.totalPosts || '0', 
      color: 'text-blue-500' 
    },
    { 
      icon: <FiUsers />, 
      label: 'Your Posts', 
      value: userStats.userPosts || '0', 
      color: 'text-green-500' 
    },
    { 
      icon: <FiTrendingUp />, 
      label: 'Likes Received', 
      value: userStats.totalLikesReceived || '0', 
      color: 'text-purple-500' 
    },
    { 
      icon: <FiStar />, 
      label: 'Saved Posts', 
      value: userStats.savedPosts || '0', 
      color: 'text-yellow-500' 
    },
  ] : [
    { 
      icon: <FiActivity />, 
      label: 'Total Posts', 
      value: '0', 
      color: 'text-blue-500' 
    },
    { 
      icon: <FiUsers />, 
      label: 'Your Posts', 
      value: '0', 
      color: 'text-green-500' 
    },
    { 
      icon: <FiTrendingUp />, 
      label: 'Likes Received', 
      value: '0', 
      color: 'text-purple-500' 
    },
    { 
      icon: <FiStar />, 
      label: 'Saved Posts', 
      value: '0', 
      color: 'text-yellow-500' 
    },
  ];

  // Reset and fetch posts when filter changes or search query changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        await dispatch(resetPage());
        await dispatch(getPosts({ page: 1, filter, search: searchQuery })).unwrap();
      } catch (error) {
        toast.error(error || 'Failed to load posts');
      }
    };
    fetchPosts();
  }, [dispatch, filter, searchQuery]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      await dispatch(getPosts({ page, filter, search: searchQuery })).unwrap();
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
    <div className="max-w-4xl mx-auto">
      {/* Search Results Header */}
      {searchQuery && (
        <div className="mb-6 animate-fadeIn">
          <div className="card-enhanced p-4 border-l-4 border-blue-500">
            <div className="flex items-center space-x-2">
              <FiSearch className="w-5 h-5 text-blue-500" />
              <span className="text-gray-900 dark:text-white">
                Search results for: <strong>"{searchQuery}"</strong>
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({posts.length} results)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Compact Enhanced Welcome Section */}
      <div className="mb-6 animate-fadeIn">
        <div className="relative p-6 mb-6 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          {/* Floating orbs for visual appeal */}
          <div className="absolute top-2 right-2 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-2 left-2 w-20 h-20 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                  Welcome back, {user?.name || 'Explorer'}!
                </h1>
                <p className="text-lg text-gray-600 dark:text-blue-100/80 leading-relaxed max-w-2xl">
                  Discover amazing AI-generated content and share your thoughts with the community.
                </p>
              </div>
              <Link
                to="/create"
                className="hidden md:flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
              >
                <FiPlusSquare className="w-5 h-5 mr-2" />
                Create Post
              </Link>
            </div>
            
            {/* Compact Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-4 border border-white/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-scaleIn"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                  <div className="relative z-10">
                    <div className={`text-2xl ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 dark:bg-white/20 h-6 w-12 rounded"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-blue-100/70 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post filtering options */}
      <div className="flex items-center justify-between mb-6 animate-slideInLeft">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            Your Feed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {filter === 'following' ? 'Posts from people you follow' : 'All posts from the community'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleFilterChange('all')}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30' 
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
            }`}
          >
            <FiTrendingUp className="w-4 h-4 mr-2" />
            All Posts
          </button>
          <button
            onClick={() => handleFilterChange('following')}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
              filter === 'following' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30' 
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
            }`}
          >
            <FiUsers className="w-4 h-4 mr-2" />
            Following
          </button>
        </div>
      </div>

      {/* Posts list - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts */}
        {posts.map((post, index) => (
          <div
            key={post._id}
            ref={index === posts.length - 1 ? lastPostRef : null}
            className="animate-fadeIn hover-lift"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <PostCard 
              post={post}
            />
          </div>
        ))}
      </div>

      {/* Loading and empty states */}
      <div className="mt-8">
        {/* Initial loading */}
        {isLoading && posts.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="py-8 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <CenteredLoader />
              <span>Loading more amazing content...</span>
            </div>
          </div>
        )}

        {/* No posts state */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-16 animate-fadeIn col-span-full">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-float">
                <FiActivity className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {filter === 'following' ? 'No posts from your network' : 'No posts yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filter === 'following' 
                  ? 'Follow some users to see their posts in your feed, or switch to "All Posts" to explore the community.' 
                  : 'Be the first to share something amazing with the community!'
                }
              </p>
              {filter === 'following' ? (
                <button
                  onClick={() => handleFilterChange('all')}
                  className="btn-primary-enhanced"
                >
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  Explore All Posts
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/create'}
                  className="btn-primary-enhanced"
                >
                  <FiUsers className="w-4 h-4 mr-2" />
                  Create Your First Post
                </button>
              )}
            </div>
          </div>
        )}

        {/* End of posts indicator */}
        {!isLoading && !hasMore && posts.length > 0 && (
          <div className="text-center py-8 animate-fadeIn col-span-full">
            <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span>You've reached the end of your feed</span>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Why not create a new post or follow more users?
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
