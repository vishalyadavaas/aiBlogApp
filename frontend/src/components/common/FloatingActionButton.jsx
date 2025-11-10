import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiPenTool, FiCpu, FiEdit, FiStar } from 'react-icons/fi';

const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      icon: <FiPenTool />,
      label: 'Write Post',
      href: '/create',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25',
    },
    {
      icon: <FiCpu />,
      label: 'AI Generate',
      href: '/create?ai=true',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/25',
    },
    {
      icon: <FiEdit />,
      label: 'Draft',
      href: '/create?draft=true',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      shadow: 'shadow-green-500/25',
    },
  ];

  return (
    <>
      {/* Mobile/Desktop Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 md:block">
        {/* Quick action buttons */}
        {isExpanded && (
          <div className="mb-4 space-y-3 animate-slideInRight">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`flex items-center space-x-3 ${action.color} ${action.shadow} text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group transform hover:-translate-y-1`}
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => setIsExpanded(false)}
              >
                <div className="text-lg group-hover:scale-110 transition-transform duration-200">{action.icon}</div>
                <span className="font-semibold text-sm whitespace-nowrap">{action.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group relative overflow-hidden ${
            isExpanded ? 'rotate-45 scale-110' : 'hover:scale-110 hover:-translate-y-1'
          }`}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Plus icon */}
          <FiPlus className="w-7 h-7 transition-transform duration-300 relative z-10" />
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping opacity-20"></div>
        </button>

        {/* Backdrop */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-fadeIn"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>

      {/* Mobile bottom bar alternative (optional for very mobile-first design) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <Link
          to="/create"
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <FiStar className="w-5 h-5" />
          <span>Create Amazing Content</span>
        </Link>
      </div>
    </>
  );
};

export default FloatingActionButton;
