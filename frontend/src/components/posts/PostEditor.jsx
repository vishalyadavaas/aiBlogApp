import { FiLoader, FiEdit3, FiType } from 'react-icons/fi';

const PostEditor = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  isSubmitting,
  isGenerating
}) => {
  return (
    <div className="space-y-6 transition-all duration-300 animate-fadeIn">
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transform transition-all duration-300 hover:shadow-2xl">
        {/* Enhanced Background Pattern */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-full transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/5 via-blue-400/5 to-purple-400/5 rounded-full transform -translate-x-16 translate-y-16"></div>
        
        {/* Loading Overlay */}
        {(isSubmitting || isGenerating) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-20 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-blue-200 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isSubmitting ? 'Saving your masterpiece...' : 'AI is crafting content...'}
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 space-y-8">
          {/* Enhanced Title Input */}
          <div className="relative group">
            <div className="flex items-center space-x-2 mb-3">
              <FiType className="w-5 h-5 text-blue-500" />
              <label 
                htmlFor="title" 
                className="block text-lg font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200 group-focus-within:text-blue-500"
              >
                Article Title
              </label>
            </div>
            <div className="relative">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Write an engaging title that captures attention..."
                className="w-full px-6 py-4 text-xl font-medium border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.01] backdrop-blur-sm"
                disabled={isSubmitting || isGenerating}
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Enhanced Content Input */}
          <div className="relative group">
            <div className="flex items-center space-x-2 mb-3">
              <FiEdit3 className="w-5 h-5 text-purple-500" />
              <label 
                htmlFor="content" 
                className="block text-lg font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200 group-focus-within:text-purple-500"
              >
                Article Content
              </label>
            </div>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="Share your thoughts, ideas, and insights... Let your creativity flow!"
                rows={12}
                className="w-full px-6 py-4 text-base leading-relaxed border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.01] backdrop-blur-sm resize-none"
                disabled={isSubmitting || isGenerating}
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-red-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-pink-500/10 group-focus-within:to-red-500/10 transition-all duration-300 pointer-events-none"></div>
            </div>
            
            {/* Character Count */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Characters: {content?.length || 0}</span>
              <span>Words: {content ? content.split(/\s+/).filter(word => word.length > 0).length : 0}</span>
            </div>
          </div>

          {/* Writing Tips */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">✨ Writing Tips</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Start with a compelling hook to grab readers' attention</li>
              <li>• Use short paragraphs and clear, concise language</li>
              <li>• Include examples and stories to illustrate your points</li>
              <li>• End with a strong conclusion or call to action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
