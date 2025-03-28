import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileHeader from '../components/profile/ProfileHeader';
import UserStats from '../components/profile/UserStats';
import PostCard from '../components/posts/PostCard';
import CenteredLoader from '../components/common/CenteredLoader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MdClose } from 'react-icons/md';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
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
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Posts navigation">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {user?._id === profileUser._id ? 'Your Posts' : 'Posts'}
              </button>
              {user?._id === profileUser._id && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'saved'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Saved Posts
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' ? (
              isPostsLoading ? (
                <CenteredLoader />
              ) : userPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {userPosts.map(post => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      onPostUpdated={refreshPosts}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No posts yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {user?._id === profileUser._id 
                      ? "You haven't published any posts yet."
                      : "This user hasn't published any posts yet."}
                  </p>
                </div>
              )
            ) : (
              isLoadingSaved ? (
                <CenteredLoader />
              ) : savedPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {savedPosts.map(post => (
                    <PostCard 
                      key={post._id} 
                      post={post}
                      onSaveToggle={refreshSavedPosts}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No saved posts</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    You haven't saved any posts yet.
                  </p>
                </div>
              )
            )}

            {user?._id === profileUser._id && (
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Delete Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
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

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] sm:w-[360px] max-h-[80vh] overflow-hidden max-w-lg mx-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Followers
              </h3>
              <button 
                onClick={() => setShowFollowersModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {followersData.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {followersData.map(follower => (
                    <li key={follower._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={follower.profilePic || 'https://via.placeholder.com/40'}
                          alt={follower.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <a
                            href={`/profile/${follower._id}`}
                            className="font-medium text-gray-900 dark:text-white hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowFollowersModal(false);
                              navigate(`/profile/${follower._id}`);
                            }}
                          >
                            {follower.name}
                          </a>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {follower.email}
                          </p>
                        </div>
                      </div>
                      
                      {user && user._id !== follower._id && (
                        follower.isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(follower._id)}
                            disabled={followLoading[follower._id]}
                            className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            {followLoading[follower._id] ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <FiUserCheck className="mr-2" />
                                Following
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(follower._id)}
                            disabled={followLoading[follower._id]}
                            className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
                          >
                            {followLoading[follower._id] ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <FiUserPlus className="mr-2" />
                                Follow
                              </>
                            )}
                          </button>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No followers yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] sm:w-[360px] max-h-[80vh] overflow-hidden max-w-lg mx-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Following
              </h3>
              <button 
                onClick={() => setShowFollowingModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {followingData.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {followingData.map(following => (
                    <li key={following._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={following.profilePic || 'https://via.placeholder.com/40'}
                          alt={following.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <a
                            href={`/profile/${following._id}`}
                            className="font-medium text-gray-900 dark:text-white hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowFollowingModal(false);
                              navigate(`/profile/${following._id}`);
                            }}
                          >
                            {following.name}
                          </a>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {following.email}
                          </p>
                        </div>
                      </div>
                      
                      {user && user._id !== following._id && (
                        following.isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(following._id)}
                            disabled={followLoading[following._id]}
                            className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            {followLoading[following._id] ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <FiUserCheck className="mr-2" />
                                Following
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(following._id)}
                            disabled={followLoading[following._id]}
                            className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
                          >
                            {followLoading[following._id] ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <FiUserPlus className="mr-2" />
                                Follow
                              </>
                            )}
                          </button>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Not following anyone yet</p>
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
