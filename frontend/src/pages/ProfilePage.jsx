import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileHeader from '../components/profile/ProfileHeader';
import UserStats from '../components/profile/UserStats';
import PostCard from '../components/posts/PostCard';
import CenteredLoader from '../components/common/CenteredLoader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MdClose } from 'react-icons/md';
import { FiUserPlus, FiUserCheck, FiEdit, FiSettings, FiBookmark, FiHeart, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { users } from '../utils/api';
import { followUserThunk, unfollowUserThunk, getCurrentUser, logout, initializeAuth, deleteAccountThunk } from '../features/auth/authSlice';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isInitialized } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('posts');
  
  // If no userId is provided in URL, use logged-in user's ID
  const targetUserId = userId || user?._id;
  const isOtherUserProfile = user && targetUserId && user._id !== targetUserId;
  const isOwnProfile = user && user._id === targetUserId;

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [followLoading, setFollowLoading] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to refresh saved posts
  const refreshSavedPosts = async () => {
    if (!user || user._id !== profileUser?._id) return;
    
    try {
      setIsLoadingSaved(true);
      const response = await users.getSavedPosts();
      if (response.data?.status === 'success') {
        setSavedPosts(response.data.data);
      } else {
        setSavedPosts([]);
      }
    } catch (error) {
      console.error('Failed to load saved posts:', error);
      toast.error('Failed to load saved posts');
    } finally {
      setIsLoadingSaved(false);
    }
  };
  
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Load saved posts for user's own profile
  useEffect(() => {
    const loadSavedPosts = async () => {
      if (!user) return;
      if (user._id !== profileUser?._id) return;
      
      try {
        setIsLoadingSaved(true);
        const response = await users.getSavedPosts();
        if (response.data?.status === 'success') {
          setSavedPosts(response.data.data);
        } else {
          setSavedPosts([]);
        }
      } catch (error) {
        console.error('Failed to load saved posts:', error);
        toast.error('Failed to load saved posts');
      } finally {
        setIsLoadingSaved(false);
      }
    };

    loadSavedPosts();
  }, [user, profileUser]);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteAccountThunk()).unwrap();
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleGetFollowers = () => {
    setShowFollowersModal(true);
  };

  const handleGetFollowing = () => {
    setShowFollowingModal(true);
  };

  const handleFollow = async (userId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      
      const result = await dispatch(followUserThunk(userId)).unwrap();
      console.log('Follow response:', result);
      
      // Update profile data with the response
      if (profileUser?._id === userId) {
        console.log('Updating profile after follow:', {
          oldState: {
            isFollowing: profileUser.isFollowing,
            followersCount: profileUser.followers.length
          },
          newState: {
            isFollowing: true,
            followersCount: result.followers.length
          }
        });
        
        setProfileUser(result.profile);
        
        // Refresh lists after state update
        const [followers, following] = await Promise.all([
          users.getFollowers(userId),
          users.getFollowing(userId)
        ]);
        
        setFollowersData(followers.data || []);
        setFollowingData(following.data || []);
      }
      
      toast.success('User followed successfully');
    } catch (error) {
      console.error('Failed to follow user:', error);
      toast.error('Failed to follow user');
      
      // Revert optimistic updates
      if (showFollowersModal) {
        setFollowersData(followers => followers.map(follower => 
          follower._id === userId ? { ...follower, isFollowing: false } : follower
        ));
      }
      
      if (showFollowingModal) {
        setFollowingData(following => following.map(followed => 
          followed._id === userId ? { ...followed, isFollowing: false } : followed
        ));
      }
      
      if (profileUser?._id === userId) {
        setProfileUser(prev => ({
          ...prev,
          isFollowing: false,
          followers: Math.max(0, prev.followers - 1)
        }));
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      
      const result = await dispatch(unfollowUserThunk(userId)).unwrap();
      console.log('Unfollow response:', result);
      
      // Update profile data with the response
      if (profileUser?._id === userId) {
        console.log('Updating profile after unfollow:', {
          oldState: {
            isFollowing: profileUser.isFollowing,
            followersCount: profileUser.followers.length
          },
          newState: {
            isFollowing: false,
            followersCount: result.followers.length
          }
        });
        
        setProfileUser(result.profile);
        
        // Refresh lists after state update
        const [followers, following] = await Promise.all([
          users.getFollowers(userId),
          users.getFollowing(userId)
        ]);
        
        setFollowersData(followers.data || []);
        setFollowingData(following.data || []);
      }
      
      toast.success('User unfollowed successfully');
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      toast.error('Failed to unfollow user');
      
      // Revert optimistic updates
      if (showFollowersModal) {
        setFollowersData(followers => followers.map(follower => 
          follower._id === userId ? { ...follower, isFollowing: true } : follower
        ));
      }
      
      if (showFollowingModal) {
        setFollowingData(following => following.map(followed => 
          followed._id === userId ? { ...followed, isFollowing: true } : followed
        ));
      }
      
      if (profileUser?._id === userId) {
        setProfileUser(prev => ({
          ...prev,
          isFollowing: true,
          followers: prev.followers + 1
        }));
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Helper function to refresh posts
  const refreshPosts = async () => {
    if (!targetUserId) return;
    
    try {
      setIsPostsLoading(true);
      const response = await users.getPosts(targetUserId);
      setUserPosts(response.data || []);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
      toast.error('Failed to refresh posts');
      setUserPosts([]);
    } finally {
      setIsPostsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    setShowFollowersModal(false);
    setShowFollowingModal(false);

    let mounted = true;
    
    setIsLoading(true);
    setProfileUser(null);
    setUserPosts([]);
    setFollowersData([]);
    setFollowingData([]);
    setFollowLoading({});

    const loadProfile = async () => {
      if (!mounted) return;
      
      if (!targetUserId) {
        setIsLoading(false);
        navigate('/login');
        return;
      }
      const profileId = targetUserId;
      
      try {
        const userData = await users.getById(profileId || user._id);
        
        if (!mounted) return;

        if (!userData?.data) {
          toast.error('User not found');
          navigate('/');
          return;
        }

        setProfileUser(userData.data);

        const [followers, following, postsData] = await Promise.all([
          users.getFollowers(profileId || user._id),
          users.getFollowing(profileId || user._id),
          users.getPosts(profileId || user._id)
        ]);
        
        if (!mounted) return;

        setFollowersData(followers.data || []);
        setFollowingData(following.data || []);
        setUserPosts(postsData.data || []);
      } catch (error) {
        if (!mounted) return;
        
        console.error('Failed to load profile:', error);
        if (error.response?.status === 404) {
          toast.error('User not found');
          navigate('/');
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [targetUserId, user, navigate, isInitialized]);

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-blue-500 hover:underline"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Enhanced Profile Header Card */}
      <div className="card-enhanced bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 border border-white/20 shadow-xl backdrop-blur-sm">
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>
          
          <div className="relative p-8">
            {profileUser && (
              <ProfileHeader 
                profile={profileUser}
                isOwnProfile={isOwnProfile}
                onFollowUser={() => profileUser.isFollowing ? handleUnfollow(profileUser._id) : handleFollow(profileUser._id)}
                isFollowLoading={followLoading[profileUser._id]}
                readOnly={isOwnProfile}
              />
            )}
            
            {profileUser && (
              <div className="mt-8">
                <UserStats 
                  stats={{
                    followers: followersData,
                    following: followingData,
                    posts: userPosts.length
                  }}
                  userId={user?._id}
                  onFollowUser={handleFollow}
                  onGetFollowers={handleGetFollowers}
                  onGetFollowing={handleGetFollowing}
                  readOnly={isOwnProfile}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="card-enhanced bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 shadow-lg">
        <div className="p-2">
          <nav className="flex space-x-2" aria-label="Posts navigation">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FiEdit className="mr-2" />
              {user?._id === profileUser._id ? 'Your Posts' : 'Posts'}
              <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">
                {userPosts.length}
              </span>
            </button>
            {user?._id === profileUser._id && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'saved'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiBookmark className="mr-2" />
                Saved Posts
                <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">
                  {savedPosts.length}
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="space-y-6">
        {activeTab === 'posts' ? (
          isPostsLoading ? (
            <div className="flex justify-center py-12">
              <CenteredLoader />
            </div>
          ) : userPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {userPosts.map((post, index) => (
                <div key={post._id} className="animate-slideIn" style={{ animationDelay: `${index * 100}ms` }}>
                  <PostCard 
                    post={post} 
                    onPostUpdated={refreshPosts}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card-enhanced text-center py-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 border border-white/20">
              <div className="animate-float">
                <FiEdit className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {user?._id === profileUser._id 
                  ? "Ready to share your thoughts? Create your first post and let your ideas shine!"
                  : "This user hasn't published any posts yet. Check back later for updates!"}
              </p>
              {user?._id === profileUser._id && (
                <button
                  onClick={() => navigate('/create')}
                  className="btn-gradient px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  Create Your First Post
                </button>
              )}
            </div>
          )
        ) : (
          isLoadingSaved ? (
            <div className="flex justify-center py-12">
              <CenteredLoader />
            </div>
          ) : savedPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {savedPosts.map((post, index) => (
                <div key={post._id} className="animate-slideIn" style={{ animationDelay: `${index * 100}ms` }}>
                  <PostCard 
                    post={post}
                    onSaveToggle={refreshSavedPosts}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card-enhanced text-center py-16 bg-gradient-to-br from-gray-50 via-yellow-50/30 to-orange-50/30 dark:from-gray-900 dark:via-yellow-900/10 dark:to-orange-900/10 border border-white/20">
              <div className="animate-float">
                <FiBookmark className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No saved posts</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start exploring and save interesting posts to build your personal collection.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Explore Posts
              </button>
            </div>
          )
        )}

        {/* Enhanced Delete Account Section */}
        {user?._id === profileUser._id && (
          <div className="card-enhanced bg-gradient-to-br from-red-50 via-pink-50/30 to-orange-50/30 dark:from-red-900/20 dark:via-pink-900/10 dark:to-orange-900/10 border border-red-200/30 dark:border-red-700/30">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <FiSettings className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] sm:w-[360px] overflow-hidden max-w-lg mx-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Delete Account
              </h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-2.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900 transition-all duration-200"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" light />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal - Enhanced and Responsive */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn p-3 sm:p-4">
          <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full sm:w-[90%] md:w-[500px] max-h-[80vh] overflow-hidden flex flex-col border border-gray-700/50">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-6 text-white flex items-center justify-between z-10">
              <h3 className="text-lg sm:text-2xl font-bold">
                Followers
              </h3>
              <button 
                onClick={() => setShowFollowersModal(false)}
                className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
              >
                <MdClose className="w-5 sm:w-6 h-5 sm:h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              {followersData.length > 0 ? (
                <ul className="divide-y divide-gray-700 space-y-0">
                  {followersData.map(follower => (
                    <li key={follower._id} className="py-4 sm:py-5 flex items-center justify-between gap-3 hover:bg-gray-800 px-2 sm:px-3 rounded-lg transition-colors">
                      <div 
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                        onClick={() => {
                          setShowFollowersModal(false);
                          navigate(`/profile/${follower._id}`);
                        }}
                      >
                        <img
                          src={follower.profilePic || 'https://via.placeholder.com/40'}
                          alt={follower.name}
                          className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-600 group-hover:border-blue-500 transition-colors"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-100 text-sm sm:text-base truncate group-hover:text-blue-400">
                            {follower.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            {follower.email}
                          </p>
                        </div>
                      </div>
                      
                      {user && user._id !== follower._id && (
                        follower.isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(follower._id)}
                            disabled={followLoading[follower._id]}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0"
                          >
                            {followLoading[follower._id] ? (
                              <LoadingSpinner size="xs" />
                            ) : (
                              <>
                                <FiUserCheck className="w-4 h-4 hidden sm:inline" />
                                <span>Following</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(follower._id)}
                            disabled={followLoading[follower._id]}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 shadow-md hover:shadow-lg"
                          >
                            {followLoading[follower._id] ? (
                              <LoadingSpinner size="xs" />
                            ) : (
                              <>
                                <FiUserPlus className="w-4 h-4 hidden sm:inline" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="text-5xl mb-4">👥</div>
                  <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-2">No followers yet</p>
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500">When people follow this user, they'll appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal - Enhanced and Responsive */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn p-3 sm:p-4">
          <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full sm:w-[90%] md:w-[500px] max-h-[80vh] overflow-hidden flex flex-col border border-gray-700/50">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-6 text-white flex items-center justify-between z-10">
              <h3 className="text-lg sm:text-2xl font-bold">
                Following
              </h3>
              <button 
                onClick={() => setShowFollowingModal(false)}
                className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
              >
                <MdClose className="w-5 sm:w-6 h-5 sm:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              {followingData.length > 0 ? (
                <ul className="divide-y divide-gray-700 space-y-0">
                  {followingData.map(following => (
                    <li key={following._id} className="py-4 sm:py-5 flex items-center justify-between gap-3 hover:bg-gray-800 px-2 sm:px-3 rounded-lg transition-colors">
                      <div 
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                        onClick={() => {
                          setShowFollowingModal(false);
                          navigate(`/profile/${following._id}`);
                        }}
                      >
                        <img
                          src={following.profilePic || 'https://via.placeholder.com/40'}
                          alt={following.name}
                          className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-600 group-hover:border-purple-500 transition-colors"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-100 text-sm sm:text-base truncate group-hover:text-purple-400">
                            {following.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            {following.email}
                          </p>
                        </div>
                      </div>
                      
                      {user && user._id !== following._id && (
                        following.isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(following._id)}
                            disabled={followLoading[following._id]}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0"
                          >
                            {followLoading[following._id] ? (
                              <LoadingSpinner size="xs" />
                            ) : (
                              <>
                                <FiUserCheck className="w-4 h-4 hidden sm:inline" />
                                <span>Following</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(following._id)}
                            disabled={followLoading[following._id]}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 shadow-md hover:shadow-lg"
                          >
                            {followLoading[following._id] ? (
                              <LoadingSpinner size="xs" />
                            ) : (
                              <>
                                <FiUserPlus className="w-4 h-4 hidden sm:inline" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="text-5xl mb-4">🔗</div>
                  <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-2">Not following anyone</p>
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500">Start following users to see their posts in your feed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
