import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiEdit, FiX, FiUserPlus, FiUserCheck, FiCalendar } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { users } from '../../utils/api';
import { updateProfile } from '../../features/auth/authSlice';

const ProfileHeader = ({ profile, isOwnProfile, onFollowUser, isFollowLoading, readOnly }) => {
  const dispatch = useDispatch();
  const { mode: themeMode } = useSelector(state => state.theme) || { mode: 'light' };
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUnfollow, setShowUnfollow] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    avatar: null,
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);

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
      {/* Enhanced Profile Header with Glass Morphism */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full transform translate-x-32 -translate-y-32 animate-morph"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-full transform -translate-x-24 translate-y-24 animate-float"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
          {/* Enhanced Avatar with Glow Effect */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse-glow"></div>
            <img
              src={profile.profilePic || 'https://via.placeholder.com/120'}
              alt={profile.name}
              className="relative w-32 h-32 rounded-full object-cover border-4 border-white/50 dark:border-gray-600/50 shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
            />
          </div>

          {/* Enhanced User Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-gradient-ai animate-fadeIn">
                  {profile.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full shadow-lg">
                    ✨ AI Creator
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Action Button */}
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="group flex items-center justify-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
                >
                  <FiEdit className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              ) : !readOnly ? (
                <button
                  disabled={isFollowLoading}
                  onClick={onFollowUser}
                  onMouseEnter={() => setShowUnfollow(true)}
                  onMouseLeave={() => setShowUnfollow(false)}
                  className={`group relative overflow-hidden px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg min-w-[140px] ${
                    profile.isFollowing 
                      ? `${showUnfollow 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'}`
                      : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600'
                  }`}
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 shimmer-bg animate-shimmer opacity-30"></div>
                  <div className="relative flex items-center justify-center">
                    {isFollowLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        {profile.isFollowing ? (
                          showUnfollow ? (
                            <>
                              <FiUserCheck className="w-4 h-4 mr-2 group-hover:animate-wiggle" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <FiUserCheck className="w-4 h-4 mr-2" />
                              Following
                            </>
                          )
                        ) : (
                          <>
                            <FiUserPlus className="w-4 h-4 mr-2 group-hover:animate-wiggle" />
                            Follow
                          </>
                        )}
                      </>
                    )}
                  </div>
                </button>
              ) : null}
            </div>

            {/* Enhanced Bio Section */}
            {profile.bio && (
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-700/30">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Edit Profile Modal - Fully Responsive */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
          <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-2xl shadow-2xl transition-all animate-scaleIn border max-h-[90vh] overflow-y-auto ${
            themeMode === 'dark'
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 shadow-blue-500/10'
              : 'bg-gradient-to-br from-white via-gray-50 to-blue-50/30 border-gray-200 shadow-xl'
          } backdrop-blur-sm`}>
            {/* Modal Header */}
            <div className={`sticky top-0 p-4 sm:p-6 flex justify-between items-center border-b ${
              themeMode === 'dark'
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-gray-700'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-gray-200'
            }`}>
              <Dialog.Title className="text-xl sm:text-2xl font-bold flex items-center">
                <FiEdit className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
                Edit Profile
              </Dialog.Title>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
              >
                <FiX className="w-5 sm:w-6 h-5 sm:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Enhanced Avatar Upload Section */}
                <div className={`flex flex-col items-center space-y-4 pb-6 border-b ${
                  themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <img
                      src={previewAvatar || profile.profilePic || 'https://via.placeholder.com/120'}
                      alt="Profile Preview"
                      className="relative w-20 sm:w-28 h-20 sm:h-28 rounded-full object-cover border-4 border-white/50 dark:border-gray-600/50 shadow-xl transform transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                  <label className="cursor-pointer">
                    <span className="btn-gradient py-2 px-4 text-sm rounded-lg font-medium inline-block">
                      Choose New Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                    JPG, PNG or GIF up to 10MB
                  </p>
                </div>

                {/* Form Fields Grid */}
                <div className="space-y-6">
                  {/* Enhanced Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-100">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 hover:border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 rounded-lg transition-all"
                      placeholder="Enter your full name"
                      required
                      maxLength="50"
                    />
                    <p className="text-xs text-gray-400 text-right">
                      {editForm.name.length}/50 characters
                    </p>
                  </div>

                  {/* Enhanced Bio Field */}
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-100">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      maxLength="160"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 hover:border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 rounded-lg transition-all resize-none"
                      placeholder="Tell us about yourself... (max 160 characters)"
                    />
                    <p className="text-xs text-gray-400 text-right">
                      {editForm.bio.length}/160 characters
                    </p>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-700 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary-enhanced w-full sm:w-auto justify-center"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-gradient w-full sm:w-auto flex items-center justify-center space-x-2"
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner size="sm" light />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiEdit className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
