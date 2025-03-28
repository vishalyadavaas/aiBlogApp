import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CenteredLoader from './common/CenteredLoader';

const AuthRoute = ({ children }) => {
  const { token, user, isLoading } = useSelector(state => state.auth);

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRoute;
