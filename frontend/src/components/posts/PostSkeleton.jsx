const PostSkeleton = () => {
  return (
    <div className="card p-6 mb-4">
      {/* Author skeleton */}
      <div className="flex items-center mb-4">
        <div className="skeleton w-10 h-10 rounded-full"></div>
        <div className="ml-3">
          <div className="skeleton w-32 h-4 mb-2"></div>
          <div className="skeleton w-24 h-3"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mb-4">
        <div className="skeleton w-3/4 h-6 mb-3"></div>
        <div className="skeleton w-full h-4 mb-2"></div>
        <div className="skeleton w-full h-4 mb-2"></div>
        <div className="skeleton w-2/3 h-4"></div>
      </div>

      {/* Image placeholder skeleton */}
      <div className="skeleton w-full h-48 rounded-lg mb-4"></div>

      {/* Actions skeleton */}
      <div className="flex items-center space-x-4">
        <div className="skeleton w-16 h-6"></div>
        <div className="skeleton w-16 h-6"></div>
        <div className="skeleton w-8 h-6"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;
