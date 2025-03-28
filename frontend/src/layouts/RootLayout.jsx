import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHome, FiPlusSquare, FiUser, FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import { toggleTheme } from '../features/theme/themeSlice';
import { logout } from '../features/auth/authSlice';

const RootLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode } = useSelector(state => state.theme);
  const { user, isInitialized } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

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

  const navLinks = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/create', icon: <FiPlusSquare />, label: 'Create' },
    { path: `/profile/${user?._id}`, icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user && !isAuthPage && (
                <button
                  ref={buttonRef}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiMenu className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              )}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative w-9 h-9 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:brightness-110">
                  <img 
                    src="/Icon.png" 
                    alt="AiBlog Logo" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">AiBlog</span>
                  <div className="h-[2px] bg-blue-600 dark:bg-blue-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="hidden w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
              </button>
              {!isAuthPage && (user ? (
                <button
                  onClick={handleLogout}
                  className="btn-primary"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary"
                >
                  Login
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {user && !isAuthPage && (
        <aside
          ref={menuRef}
          className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-white border-r border-gray-200 lg:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
        >
          <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
            <ul className="space-y-2 font-medium">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white ${
                      location.pathname === link.path
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className={`p-4 ${user && !isAuthPage ? 'lg:ml-64' : ''} pt-20`}>
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
