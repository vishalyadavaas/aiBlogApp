import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PUBLIC_ROUTES = ['/login', '/register'];

const RouterConfig = ({ children }) => {
  const { token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle authentication redirects
    if (token && PUBLIC_ROUTES.includes(location.pathname)) {
      // Redirect authenticated users away from public routes
      navigate('/');
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname, token]);

  // Save last private route for post-login redirect
  useEffect(() => {
    if (!PUBLIC_ROUTES.includes(location.pathname)) {
      sessionStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname]);

  return children;
};

export default RouterConfig;
