import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiEdit, FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { users } from '../../utils/api';
import { updateProfile } from '../../features/auth/authSlice';

const ProfileHeader = ({ profile, isOwnProfile, onFollowUser, isFollowLoading, readOnly }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUnfollow, setShowUnfollow] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    avatar: null,
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const dispatch = useDispatch();

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditForm(prev => ({ ...prev, avatar: e.target.files[0] }));
      setPreviewAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('bio', editForm.bio);
      if (editForm.avatar) {
        formData.append('profilePic', editForm.avatar);
      }

      const response = await users.updateProfile(formData);
      dispatch(updateProfile(response.data));
      setShowEditModal(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="mb-8">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={profile.profilePic || 'https://via.placeholder.com/100'}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>

        {/* User info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.name}
            </h1>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 gap-2"
              >
                <FiEdit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : !readOnly ? (
              <button
                disabled={isFollowLoading}
                onClick={onFollowUser}
                onMouseEnter={() => setShowUnfollow(true)}
                onMouseLeave={() => setShowUnfollow(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center min-w-[100px] transition-all duration-200 ${
                  profile.isFollowing 
                    ? `${showUnfollow 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    {profile.isFollowing ? (
                      showUnfollow ? 'Unfollow' : 'Following'
                    ) : (
                      'Follow'
                    )}
                  </>
                )}
              </button>
            ) : null}
          </div>
          {profile.bio && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-2xl transition-all animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Profile
              </Dialog.Title>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar upload */}
              <div className="flex flex-col items-center">
                <img
                  src={previewAvatar || profile.profilePic || 'https://via.placeholder.com/100'}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="btn-secondary text-sm cursor-pointer"
                >
                  Change Avatar
                </label>
              </div>

              {/* Name input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input-field"
                  required
                />
              </div>

              {/* Bio input */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="input-field min-h-[100px] resize-y"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Submit button */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-200"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" light />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
