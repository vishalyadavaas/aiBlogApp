import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHome, FiPlusSquare, FiUser, FiMenu, FiLogOut, FiLogIn, FiSearch } from 'react-icons/fi';
import { logout } from '../features/auth/authSlice';
import { users } from '../utils/api';
import Footer from '../components/common/Footer';

const RootLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { user, isInitialized } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Load user stats
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return;
      
      try {
        setLoadingStats(true);
        const response = await users.getStats();
        if (response.data) {
          setUserStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load user stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      loadUserStats();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && 
          menuRef.current && 
          buttonRef.current &&
          !menuRef.current.contains(event.target) &&
          !buttonRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  if (!isInitialized) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter posts
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { path: '/', icon: <FiHome />, label: 'Home', description: 'Latest posts' },
    { path: '/create', icon: <FiPlusSquare />, label: 'Create', description: 'Write a new post' },
    { path: `/profile/${user?._id}`, icon: <FiUser />, label: 'Profile', description: 'Your profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Navigation - Hidden on auth pages */}
      {!isAuthPage && (
        <nav className="fixed top-0 z-50 w-full bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 backdrop-blur-lg border-b border-gray-700/30 shadow-2xl">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user && !isAuthPage && (
                <button
                  ref={buttonRef}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg lg:hidden hover:bg-white/10 transition-all duration-200 hover:scale-110 border border-gray-600/30 hover:border-blue-500/50"
                >
                  <FiMenu className="w-6 h-6 text-gray-300 hover:text-white" />
                </button>
              )}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative w-10 h-10 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 animate-float bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-1">
                  <img 
                    src="/Icon.png" 
                    alt="AiBlog Logo" 
                    className="w-full h-full object-contain drop-shadow-lg filter group-hover:drop-shadow-xl"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AiBlog
                  </span>
                  <div className="h-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            {user && !isAuthPage && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="w-full relative">
                  <input
                    type="text"
                    placeholder="Search posts, topics, or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800/80 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm text-white placeholder-gray-400 hover:bg-gray-700/80"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </form>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {!isAuthPage && (user ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    to={`/profile/${user._id}`}
                    className="hidden sm:flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-gray-600/30 hover:border-blue-500/50"
                  >
                    <img
                      src={user.profilePic || 'https://via.placeholder.com/32'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/50"
                    />
                    <span className="text-sm font-medium text-gray-300 hover:text-white">
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    title="Logout"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Compact Enhanced Sidebar */}
      {user && !isAuthPage && (
        <aside
          ref={menuRef}
          className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-all duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/30 shadow-xl`}
        >
          <div className="h-full px-4 pb-4 overflow-y-auto">
            {/* Compact User Profile Section */}
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-pink-100/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border border-blue-200/30 dark:border-blue-700/30 animate-slideInLeft backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <img
                  src={user.profilePic || 'https://via.placeholder.com/40'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/80 dark:border-gray-600/50 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Enhanced Navigation Links */}
            <ul className="space-y-2 font-medium mb-4">
              {navLinks.map((link, index) => (
                <li key={link.path} className="animate-slideInLeft" style={{animationDelay: `${index * 0.1}s`}}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group
                      ${location.pathname === link.path
                        ? 'bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-pink-500/40 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 transform scale-102'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-pink-500/10 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-blue-300/30 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {location.pathname === link.path && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      text-lg transition-all duration-300 
                      ${location.pathname === link.path 
                        ? 'text-white drop-shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }
                    `}>
                      {link.icon}
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className={`
                        font-medium text-sm transition-all duration-300 truncate
                        ${location.pathname === link.path 
                          ? 'text-white' 
                          : 'text-gray-900 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                        }
                      `}>
                        {link.label}
                      </div>
                      <div className={`
                        text-xs transition-all duration-300 truncate
                        ${location.pathname === link.path 
                          ? 'text-blue-100' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }
                      `}>
                        {link.description}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Compact Quick Stats */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-red-100/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 border border-purple-200/30 dark:border-purple-700/30 animate-slideInLeft backdrop-blur-sm" style={{animationDelay: '0.4s'}}>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                Quick Stats
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {loadingStats ? (
                  <div className="col-span-2 flex justify-center py-1">
                    <div className="animate-spin rounded-full h-3 w-3 border border-purple-400 border-t-transparent"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{userStats?.userPosts || 0}</div>
                      <div className="text-gray-600 dark:text-gray-400">Posts</div>
                    </div>
                    <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="font-bold text-purple-600 dark:text-purple-400">{userStats?.followers || 0}</div>
                      <div className="text-gray-600 dark:text-gray-400">Followers</div>
                    </div>
                    <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="font-bold text-pink-600 dark:text-pink-400">{userStats?.following || 0}</div>
                      <div className="text-gray-600 dark:text-gray-400">Following</div>
                    </div>
                    <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="font-bold text-green-600 dark:text-green-400">{userStats?.totalLikesReceived || 0}</div>
                      <div className="text-gray-600 dark:text-gray-400">Likes</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content with enhanced styling and proper mobile spacing */}
      <div className={`p-4 ${user && !isAuthPage ? 'lg:ml-64' : ''} ${!isAuthPage ? 'pt-20' : ''} ${user && !isAuthPage ? 'pb-20 md:pb-4' : ''} min-h-screen`}>
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </div>

      {/* Mobile search overlay with improved positioning */}
      {user && !isAuthPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-gray-900/95 via-blue-900/80 to-transparent backdrop-blur-lg border-t border-gray-700/30 safe-area-inset-bottom">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search posts, topics, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-800/90 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-white placeholder-gray-400 hover:bg-gray-700/90 focus:bg-gray-700/90 shadow-lg"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RootLayout;
