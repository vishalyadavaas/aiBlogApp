import React, { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { initializeAuth } from './features/auth/authSlice';
import RootLayout from './layouts/RootLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';
import RouterConfig from './router/RouterConfig';
import CenteredLoader from './components/common/CenteredLoader';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const CreatePostPage = React.lazy(() => import('./pages/CreatePostPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const PostDetailsPage = React.lazy(() => import('./pages/PostDetailsPage'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RouterConfig><RootLayout /></RouterConfig>}>
      <Route path="/">
        <Route 
          index 
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<CenteredLoader />}>
                <HomePage />
              </React.Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="login" 
          element={
            <AuthRoute>
              <React.Suspense fallback={<CenteredLoader />}>
                <LoginPage />
              </React.Suspense>
            </AuthRoute>
          } 
        />
        <Route 
          path="register" 
          element={
            <AuthRoute>
              <React.Suspense fallback={<CenteredLoader />}>
                <RegisterPage />
              </React.Suspense>
            </AuthRoute>
          } 
        />
        <Route 
          path="create" 
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<CenteredLoader />}>
                <CreatePostPage />
              </React.Suspense>
            </ProtectedRoute>
          } 
        />
        <Route path="profile/:userId?" element={
          <ProtectedRoute>
            <React.Suspense fallback={<CenteredLoader />}>
              <ProfilePage />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route 
          path="post/:id" 
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<CenteredLoader />}>
                <PostDetailsPage />
              </React.Suspense>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <p className="text-gray-600 dark:text-gray-400">Page not found</p>
          </div>
        } />
      </Route>
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  const dispatch = useDispatch();
  const { mode } = useSelector(state => state.theme) || { mode: 'light' };
  const { isInitialized } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return <CenteredLoader fullScreen />;
  }

  return (
    <React.Suspense fallback={<CenteredLoader fullScreen />}>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode}
      />
    </React.Suspense>
  );
}

export default App;
