import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { followUserThunk, unfollowUserThunk } from '../../features/auth/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const UserStats = ({ stats, userId, onFollowUser, readOnly }) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const [showUnfollow, setShowUnfollow] = useState({});
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector(state => state.auth);
  
  const handleFollowUnfollow = async (targetUserId, isFollowing) => {
    if (userId === targetUserId) return;
    
    try {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
      
      if (isFollowing) {
        await dispatch(unfollowUserThunk(targetUserId)).unwrap();
      } else {
        await dispatch(followUserThunk(targetUserId)).unwrap();
      }
      
      // Call the parent component's handler to refresh the profile data
      if (onFollowUser) {
        onFollowUser(targetUserId);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };
  
  // Check if current user is following a specific user
  const isFollowing = (targetUserId) => {
    return currentUser?.following?.includes(targetUserId) || 
           stats.following.some(user => user._id === targetUserId);
  };

  const renderFollowButton = (user, showAsUnfollow = false) => (
    <button
      onClick={() => handleFollowUnfollow(user._id, showAsUnfollow)}
      onMouseEnter={() => setShowUnfollow(prev => ({ ...prev, [user._id]: true }))}
      onMouseLeave={() => setShowUnfollow(prev => ({ ...prev, [user._id]: false }))}
      disabled={followLoading[user._id]}
      className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center min-w-[100px] transition-colors duration-200 ${
        showAsUnfollow
          ? `${showUnfollow[user._id]
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {followLoading[user._id] ? (
        <LoadingSpinner size="sm" />
      ) : (
        showAsUnfollow ? (
          showUnfollow[user._id] ? 'Unfollow' : 'Following'
        ) : (
          'Follow'
        )
      )}
    </button>
  );

  return (
    <>
      <div className="flex space-x-12 justify-center py-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setShowFollowers(true)}
          className="text-center hover:opacity-75 px-4"
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.followers.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Followers
          </div>
        </button>
        <button
          onClick={() => setShowFollowing(true)}
          className="text-center hover:opacity-75 px-4"
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.following.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Following
          </div>
        </button>
        <div className="text-center px-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.posts}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
        </div>
      </div>

      {/* Followers Modal */}
      <Dialog
        open={showFollowers}
        onClose={() => setShowFollowers(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                Followers ({stats.followers.length})
              </Dialog.Title>
              <button
                onClick={() => setShowFollowers(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {stats.followers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center justify-between py-3"
                >
                  <Link
                    to={`/profile/${follower._id}`}
                    className="flex items-center flex-1"
                    onClick={() => setShowFollowers(false)}
                  >
                    <img
                      src={follower.profilePic || 'https://via.placeholder.com/40'}
                      alt={follower.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {follower.name}
                      </div>
                      {follower.bio && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {follower.bio.substring(0, 30)}
                          {follower.bio.length > 30 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </Link>
                  {userId !== follower._id && currentUser && !readOnly && (
                    renderFollowButton(follower, isFollowing(follower._id))
                  )}
                </div>
              ))}
              {stats.followers.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No followers yet
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Following Modal */}
      <Dialog
        open={showFollowing}
        onClose={() => setShowFollowing(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                Following ({stats.following.length})
              </Dialog.Title>
              <button
                onClick={() => setShowFollowing(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {stats.following.map((followed) => (
                <div
                  key={followed._id}
                  className="flex items-center justify-between py-3"
                >
                  <Link
                    to={`/profile/${followed._id}`}
                    className="flex items-center flex-1"
                    onClick={() => setShowFollowing(false)}
                  >
                    <img
                      src={followed.profilePic || 'https://via.placeholder.com/40'}
                      alt={followed.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {followed.name}
                      </div>
                      {followed.bio && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {followed.bio.substring(0, 30)}
                          {followed.bio.length > 30 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </Link>
                  {userId !== followed._id && currentUser && !readOnly && (
                    renderFollowButton(followed, true)
                  )}
                </div>
              ))}
              {stats.following.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Not following anyone yet
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default UserStats;
