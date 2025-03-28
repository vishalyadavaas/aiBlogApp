const LoadingSpinner = ({ size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full animate-spin border-t-transparent ${
        light ? 'border-white' : 'border-blue-600'
      }`}
    />
  );
};

export default LoadingSpinner;
