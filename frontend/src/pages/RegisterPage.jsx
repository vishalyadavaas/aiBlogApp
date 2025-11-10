import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiStar, FiZap, FiHeart, FiUsers, FiCpu } from 'react-icons/fi';
import { registerUserThunk } from '../features/auth/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading } = useSelector(state => state.auth);
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
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const result = await dispatch(registerUserThunk(formData));
    if (registerUserThunk.fulfilled.match(result)) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Something went wrong');
    }
  };

  const features = [
    { icon: <FiCpu />, title: 'AI Chatbot Assistant', description: 'Get instant help with coding, writing, and problem-solving', color: 'from-blue-500 to-cyan-500' },
    { icon: <FiHeart />, title: 'Smart Content Creation', description: 'AI-powered blog generation and editing tools', color: 'from-purple-500 to-pink-500' },
    { icon: <FiZap />, title: 'Code Highlighting', description: 'Beautiful syntax highlighting in chat responses', color: 'from-orange-500 to-yellow-500' },
    { icon: <FiUsers />, title: 'Creative Community', description: 'Connect with like-minded creators worldwide', color: 'from-green-500 to-emerald-500' },
  ];

  const benefits = [
    'AI-powered content generation',
    'Connect with creative community',
    'Personalized content feed',
    'Advanced analytics and insights',
    'Real-time collaboration tools',
    'Priority customer support'
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      themeMode === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-white'
    }`}>
      {/* Enhanced background decorations */}
      <div className={`absolute top-0 left-0 w-96 h-96 rounded-full transform -translate-x-48 -translate-y-48 animate-float blur-3xl ${
        themeMode === 'dark'
          ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20'
          : 'bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30'
      }`}></div>
      <div className={`absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full transform translate-x-64 translate-y-64 animate-float blur-3xl ${
        themeMode === 'dark'
          ? 'bg-gradient-to-tl from-purple-500/20 via-pink-500/20 to-cyan-500/20'
          : 'bg-gradient-to-tl from-purple-400/30 via-pink-400/30 to-cyan-400/30'
      }`} style={{animationDelay: '2s'}}></div>
      <div className={`absolute top-1/2 left-1/4 w-64 h-64 rounded-full transform -translate-y-32 animate-float blur-2xl ${
        themeMode === 'dark'
          ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20'
          : 'bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30'
      }`} style={{animationDelay: '1s'}}></div>

      <div className="flex min-h-screen items-center justify-center py-4 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            
            {/* Left side - Registration form */}
            <div className="w-full max-w-lg mx-auto lg:mx-0 animate-slideInLeft order-2 lg:order-1">
              <div className={`p-4 sm:p-6 backdrop-blur-2xl relative overflow-hidden shadow-2xl border rounded-3xl ${
                themeMode === 'dark'
                  ? 'bg-gray-900/40 border-gray-700/50'
                  : 'bg-white/80 border-white/60'
              }`}>
                {/* Enhanced Form background decoration */}
                <div className={`absolute inset-0 rounded-3xl ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5'
                    : 'bg-gradient-to-br from-blue-400/10 via-transparent to-purple-400/10'
                }`}></div>
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full transform translate-x-20 -translate-y-20 blur-xl ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10'
                    : 'bg-gradient-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20'
                }`}></div>
                <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full transform -translate-x-16 translate-y-16 animate-float blur-xl ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-tr from-purple-400/10 via-pink-400/10 to-cyan-400/10'
                    : 'bg-gradient-to-tr from-purple-300/20 via-pink-300/20 to-cyan-300/20'
                }`}></div>
                
                <div className="relative z-10">
                  {/* Enhanced Header */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300">
                      <img 
                        src="/Icon.png" 
                        alt="AiBlog Logo" 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-lg"
                      />
                    </div>
                    <h2 className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ${
                      themeMode === 'dark' 
                        ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                    }`}>
                      Join AI Blog
                    </h2>
                    <p className={`text-sm sm:text-base ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Start your creative journey with AI-powered blogging
                    </p>
                  </div>

                  <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                    {/* Enhanced Name field */}
                    <div className="space-y-1 sm:space-y-2">
                      <label
                        htmlFor="name"
                        className={`flex items-center text-xs sm:text-sm font-semibold ${
                          themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        <FiUser className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500" />
                        Full Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                          <FiUser className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                            themeMode === 'dark' 
                              ? 'text-gray-400 group-focus-within:text-blue-400' 
                              : 'text-gray-500 group-focus-within:text-blue-500'
                          }`} />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          className={`w-full pl-12 sm:pl-14 py-3 sm:py-4 text-sm sm:text-base rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                            themeMode === 'dark'
                              ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-500'
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400'
                          } backdrop-blur-sm`}
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                          themeMode === 'dark'
                            ? 'bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5'
                            : 'bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-focus-within:from-blue-400/10 group-focus-within:via-purple-400/10 group-focus-within:to-pink-400/10'
                        }`}></div>
                      </div>
                    </div>

                    {/* Enhanced Email field */}
                    <div className="space-y-1 sm:space-y-2">
                      <label
                        htmlFor="email"
                        className={`flex items-center text-xs sm:text-sm font-semibold ${
                          themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        <FiMail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-500" />
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                          <FiMail className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                            themeMode === 'dark' 
                              ? 'text-gray-400 group-focus-within:text-purple-400' 
                              : 'text-gray-500 group-focus-within:text-purple-500'
                          }`} />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className={`w-full pl-12 sm:pl-14 py-3 sm:py-4 text-sm sm:text-base rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                            themeMode === 'dark'
                              ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-500'
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 hover:border-gray-400'
                          } backdrop-blur-sm`}
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                          themeMode === 'dark'
                            ? 'bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-pink-500/5 group-focus-within:to-cyan-500/5'
                            : 'bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-cyan-400/0 group-focus-within:from-purple-400/10 group-focus-within:via-pink-400/10 group-focus-within:to-cyan-400/10'
                        }`}></div>
                      </div>
                    </div>

                    {/* Enhanced Password field */}
                    <div className="space-y-1 sm:space-y-2">
                      <label
                        htmlFor="password"
                        className={`flex items-center text-xs sm:text-sm font-semibold ${
                          themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        <FiLock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-pink-500" />
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                          <FiLock className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                            themeMode === 'dark' 
                              ? 'text-gray-400 group-focus-within:text-pink-400' 
                              : 'text-gray-500 group-focus-within:text-pink-500'
                          }`} />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          className={`w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 text-sm sm:text-base rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                            themeMode === 'dark'
                              ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-500'
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-400'
                          } backdrop-blur-sm`}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:scale-110 transition-transform duration-200 z-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FiEyeOff className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
                              themeMode === 'dark'
                                ? 'text-gray-400 hover:text-pink-400'
                                : 'text-gray-500 hover:text-pink-500'
                            }`} />
                          ) : (
                            <FiEye className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
                              themeMode === 'dark'
                                ? 'text-gray-400 hover:text-pink-400'
                                : 'text-gray-500 hover:text-pink-500'
                            }`} />
                          )}
                        </button>
                        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                          themeMode === 'dark'
                            ? 'bg-gradient-to-r from-pink-500/0 via-rose-500/0 to-red-500/0 group-focus-within:from-pink-500/5 group-focus-within:via-rose-500/5 group-focus-within:to-red-500/5'
                            : 'bg-gradient-to-r from-pink-400/0 via-rose-400/0 to-red-400/0 group-focus-within:from-pink-400/10 group-focus-within:via-rose-400/10 group-focus-within:to-red-400/10'
                        }`}></div>
                      </div>
                      <p className={`text-xs flex items-center ${
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-green-500" />
                        Must be at least 6 characters long
                      </p>
                    </div>

                    {/* Enhanced Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 sm:py-4 flex justify-center items-center space-x-2 sm:space-x-3 group relative overflow-hidden text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                            <span>Create Your Account</span>
                            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Enhanced Login link */}
                    <div className="text-center pt-1 sm:pt-2">
                      <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Already have an account?
                      </p>
                      <Link
                        to="/login"
                        className={`inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 space-x-1 sm:space-x-2 group border ${
                          themeMode === 'dark'
                            ? 'text-purple-400 hover:text-white bg-purple-900/20 hover:bg-purple-600 border-purple-700 hover:shadow-lg'
                            : 'text-purple-600 hover:text-white bg-purple-100 hover:bg-purple-500 border-purple-300 hover:shadow-lg'
                        }`}
                      >
                        <span>Sign in to your account</span>
                        <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Right side - Welcome & Features */}
            <div className="flex flex-col justify-center space-y-8 lg:pl-8 order-1 lg:order-2">
              {/* Welcome Header */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                    Join the Future
                  </span>
                  <br />
                  <span className={`${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  } drop-shadow-sm`}>
                    of Blogging
                  </span>
                </h1>
                <p className={`text-lg md:text-xl ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8`}>
                  Create an account and start your journey with AI-powered content creation
                </p>
              </div>

              {/* Enhanced Features Grid */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`group flex items-start space-x-4 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                      themeMode === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        : 'bg-white/60 border-white/40 hover:bg-white/80 hover:border-white/60'
                    } shadow-lg hover:shadow-xl`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s ease-out both'
                    }}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold mb-2 ${
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      } leading-relaxed`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Benefits List */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                themeMode === 'dark'
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/60 border-white/40'
              } shadow-lg`}>
                <h3 className={`text-lg font-bold mb-4 ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  What you'll get with AI Blog:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animation: 'fadeInLeft 0.6s ease-out both'
                      }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      <span className={`text-sm font-medium ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
