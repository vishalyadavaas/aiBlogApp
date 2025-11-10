const PostSkeleton = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 h-full flex flex-col animate-pulse">
      {/* Floating orbs for visual appeal */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-pink-400/10 to-yellow-400/10 rounded-full blur-lg"></div>
      
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-shimmer"></div>
            <div className="flex-1">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-24 mb-1 animate-shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-16 animate-shimmer"></div>
            </div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-shimmer"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full animate-shimmer"></div>
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 animate-shimmer"></div>
        </div>

        {/* Enhanced Content skeleton with more lines */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-2/3 animate-shimmer"></div>
        </div>

        {/* Tags skeleton */}
        <div className="flex space-x-2 mb-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-16 animate-shimmer"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-20 animate-shimmer"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-24 animate-shimmer"></div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-shimmer"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-shimmer"></div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-shimmer"></div>
          </div>
          <div className="w-16 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
