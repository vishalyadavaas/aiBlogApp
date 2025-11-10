import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUsers, FiCpu, FiStar, FiZap } from 'react-icons/fi';
import { loginUserThunk } from '../features/auth/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error } = useSelector(state => state.auth);
  const { mode: themeMode } = useSelector(state => state.theme) || { mode: 'light' };
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await dispatch(loginUserThunk(formData));
    if (loginUserThunk.fulfilled.match(result)) {
      toast.success('🎉 Welcome back!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Something went wrong');
    }
  };

  const features = [
    { icon: <FiCpu />, title: 'AI Chatbot Assistant', description: 'Get instant help with coding, writing, and problem-solving', color: 'from-blue-500 to-cyan-500' },
    { icon: <FiUsers />, title: 'Creative Community', description: 'Connect with like-minded creators worldwide', color: 'from-purple-500 to-pink-500' },
    { icon: <FiStar />, title: 'Smart Content Creation', description: 'AI-powered blog generation and editing tools', color: 'from-orange-500 to-yellow-500' },
    { icon: <FiZap />, title: 'Code Highlighting', description: 'Beautiful syntax highlighting in chat responses', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      themeMode === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-white'
    } relative overflow-hidden`}>
      {/* Enhanced floating orbs for visual appeal */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full transform -translate-x-48 -translate-y-48 animate-float blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-full transform translate-x-40 translate-y-40 animate-float blur-3xl" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-full animate-float blur-2xl" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-tl from-pink-500/20 via-violet-500/20 to-cyan-500/20 rounded-full transform translate-x-64 translate-y-64 animate-float blur-3xl" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-full transform -translate-y-32 animate-float blur-2xl" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-full animate-float blur-2xl" style={{animationDelay: '3s'}}></div>

      <div className="flex min-h-screen items-center justify-center py-4 sm:py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch lg:items-center min-h-[calc(100vh-8rem)] lg:min-h-0">
            
            {/* Left side - Features and branding (hidden on mobile for better UX) */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center space-y-6 lg:space-y-8 animate-slideInLeft order-1">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4 lg:mb-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform duration-300">
                    <img src="/Icon.png" alt="AiBlog" className="w-6 h-6 lg:w-8 lg:h-8" />
                  </div>
                  <h1 className={`text-3xl lg:text-4xl font-bold ${
                    themeMode === 'dark' 
                      ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                  }`}>AI Blog</h1>
                </div>
                <h2 className={`text-2xl lg:text-3xl font-bold mb-3 lg:mb-4 ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome to the Future of Blogging
                </h2>
                <p className={`text-base lg:text-lg mb-6 lg:mb-8 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Create, share, and discover amazing AI-generated content with our intelligent blogging platform.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 lg:space-y-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                      themeMode === 'dark'
                        ? 'bg-gray-800/90 border-gray-700 hover:border-gray-600'
                        : 'bg-white/60 border-white/40 hover:border-white/60'
                    } shadow-lg hover:shadow-xl animate-slideInLeft`}
                    style={{animationDelay: `${index * 0.2 + 0.5}s`}}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-white shadow-lg bg-gradient-to-r ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm lg:text-base font-semibold mb-1 ${
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-xs lg:text-sm ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex items-center justify-center w-full max-w-md mx-auto lg:mx-0 animate-slideInRight order-1 lg:order-2">
              <div className={`w-full p-4 sm:p-6 lg:p-8 backdrop-blur-2xl relative overflow-hidden shadow-2xl border rounded-2xl lg:rounded-3xl ${
                themeMode === 'dark'
                  ? 'bg-gray-900/40 border-gray-700/50'
                  : 'bg-white/80 border-white/60'
              }`}>
                {/* Enhanced Form background decoration with multiple layers */}
                <div className={`absolute inset-0 rounded-2xl lg:rounded-3xl ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5'
                    : 'bg-gradient-to-br from-blue-400/10 via-transparent to-purple-400/10'
                }`}></div>
                <div className={`absolute top-0 right-0 w-32 lg:w-40 h-32 lg:h-40 rounded-full transform translate-x-16 lg:translate-x-20 -translate-y-16 lg:-translate-y-20 blur-xl ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10'
                    : 'bg-gradient-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20'
                }`}></div>
                <div className={`absolute bottom-0 left-0 w-24 lg:w-32 h-24 lg:h-32 rounded-full transform -translate-x-12 lg:-translate-x-16 translate-y-12 lg:translate-y-16 animate-float blur-xl ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-tr from-emerald-400/10 via-cyan-400/10 to-blue-400/10'
                    : 'bg-gradient-to-tr from-emerald-300/20 via-cyan-300/20 to-blue-300/20'
                }`}></div>
                <div className="relative z-10">
                  <div className="text-center mb-4 sm:mb-6 lg:mb-8 relative z-20">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl border hover:scale-105 transition-all duration-300 border-white/20">
                      <img src="/Icon.png" alt="AiBlog" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 drop-shadow-lg" />
                    </div>
                    <h2 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg ${
                      themeMode === 'dark' 
                        ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                    }`}>
                      Welcome Back
                    </h2>
                    <p className={`text-sm sm:text-base lg:text-lg font-medium ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Sign in to continue your creative journey
                    </p>
                  </div>

                  <form className="space-y-3 sm:space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
                    {/* Enhanced Email field */}
                    <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                      <label
                        htmlFor="email"
                        className={`flex items-center text-xs sm:text-sm font-semibold ${
                          themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        <FiMail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500" />
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                          <FiMail className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-colors duration-300 ${
                            themeMode === 'dark'
                              ? 'text-gray-400 group-focus-within:text-blue-400'
                              : 'text-gray-500 group-focus-within:text-blue-500'
                          }`} />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className={`w-full pl-10 sm:pl-12 lg:pl-14 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base rounded-xl lg:rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                            themeMode === 'dark'
                              ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-500'
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400'
                          } backdrop-blur-sm`}
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <div className={`absolute inset-0 rounded-xl lg:rounded-2xl transition-all duration-300 pointer-events-none ${
                          themeMode === 'dark'
                            ? 'bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5'
                            : 'bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-focus-within:from-blue-400/10 group-focus-within:via-purple-400/10 group-focus-within:to-pink-400/10'
                        }`}></div>
                      </div>
                    </div>

                    {/* Enhanced Password field */}
                    <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                      <label
                        htmlFor="password"
                        className={`flex items-center text-xs sm:text-sm font-semibold ${
                          themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        <FiLock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-500" />
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                          <FiLock className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-colors duration-300 ${
                            themeMode === 'dark'
                              ? 'text-gray-400 group-focus-within:text-purple-400'
                              : 'text-gray-500 group-focus-within:text-purple-500'
                          }`} />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          className={`w-full pl-10 sm:pl-12 lg:pl-14 pr-10 sm:pr-12 lg:pr-14 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base rounded-xl lg:rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                            themeMode === 'dark'
                              ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-500'
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-400'
                          } backdrop-blur-sm`}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:scale-110 transition-transform duration-200 z-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FiEyeOff className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-colors duration-300 ${
                              themeMode === 'dark'
                                ? 'text-gray-400 hover:text-purple-400'
                                : 'text-gray-500 hover:text-purple-500'
                            }`} />
                          ) : (
                            <FiEye className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-colors duration-300 ${
                              themeMode === 'dark'
                                ? 'text-gray-400 hover:text-purple-400'
                                : 'text-gray-500 hover:text-purple-500'
                            }`} />
                          )}
                        </button>
                        <div className={`absolute inset-0 rounded-xl lg:rounded-2xl transition-all duration-300 pointer-events-none ${
                          themeMode === 'dark'
                            ? 'bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-pink-500/5 group-focus-within:to-cyan-500/5'
                            : 'bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-cyan-400/0 group-focus-within:from-purple-400/10 group-focus-within:via-pink-400/10 group-focus-within:to-cyan-400/10'
                        }`}></div>
                      </div>
                    </div>

                    {/* Forgot password link */}
                    <div className="flex justify-end">
                      <a href="#" className={`text-xs sm:text-sm transition-colors duration-200 hover:underline ${
                        themeMode === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                      }`}>
                        Forgot your password?
                      </a>
                    </div>

                    {/* Enhanced Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 sm:py-4 flex justify-center items-center space-x-2 sm:space-x-3 group relative overflow-hidden text-sm sm:text-base font-semibold rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        themeMode === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white focus:ring-blue-500/20 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white focus:ring-blue-500/20 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {/* Button shimmer effect */}
                      <div className={`absolute inset-0 animate-shimmer opacity-30 ${
                        themeMode === 'dark'
                          ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                          : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
                      } -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
                      <div className="relative flex items-center space-x-1 sm:space-x-2">
                        {isLoading ? (
                          <LoadingSpinner light />
                        ) : (
                          <>
                            <span>Sign In to AI Blog</span>
                            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Enhanced Divider */}
                    <div className="relative my-4 sm:my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${
                          themeMode === 'dark' ? 'border-gray-600' : 'border-gray-300'
                        }`} />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className={`px-3 sm:px-4 font-medium backdrop-blur-sm rounded-full border text-xs sm:text-sm ${
                          themeMode === 'dark'
                            ? 'bg-gray-800/80 text-gray-400 border-gray-600/50'
                            : 'bg-white/90 text-gray-600 border-gray-300/60'
                        }`}>
                          New to AI Blog?
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Register link */}
                    <div className="text-center">
                      <Link
                        to="/register"
                        className={`inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 space-x-1 sm:space-x-2 group border ${
                          themeMode === 'dark'
                            ? 'text-blue-400 hover:text-white bg-blue-900/20 hover:bg-blue-600 border-blue-700 hover:shadow-lg'
                            : 'text-blue-600 hover:text-white bg-blue-100 hover:bg-blue-500 border-blue-300 hover:shadow-lg'
                        }`}
                      >
                        <span>Create a new account</span>
                        <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
