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
      <nav className="fixed top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {user && !isAuthPage && (
                <button
                  ref={buttonRef}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiMenu className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              )}
              <Link to="/" className="flex ml-2 md:mr-24">
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                  AiBlog
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'dark' ? 'Light' : 'Dark'}
                </span>
              </button>
              {!isAuthPage && (user ? (
                <button
                  onClick={handleLogout}
                  className="ml-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="ml-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
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
