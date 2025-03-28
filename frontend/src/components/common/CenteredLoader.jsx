import LoadingSpinner from './LoadingSpinner';

const CenteredLoader = ({ fullScreen = false }) => {
  return (
    <div 
      className={`flex items-center justify-center ${
        fullScreen ? 'fixed inset-0 bg-white dark:bg-gray-900' : 'min-h-[60vh]'
      }`}
    >
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default CenteredLoader;
