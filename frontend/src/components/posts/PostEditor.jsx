import { FiLoader } from 'react-icons/fi';

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
      <div className="card p-6 space-y-6 transform transition-all duration-300 hover:shadow-xl relative overflow-hidden dark:bg-gray-800/50">
        {/* Loading Overlay */}
        {(isSubmitting || isGenerating) && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
              <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isSubmitting ? 'Saving changes...' : 'Generating content...'}
              </span>
            </div>
          </div>
        )}

        {/* Title Input */}
        <div className="relative group">
          <label 
            htmlFor="title" 
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2 group-focus-within:text-blue-500"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Write an engaging title..."
            className="input-field w-full transform transition-all duration-200 focus:scale-[1.01]"
            disabled={isSubmitting || isGenerating}
            required
          />
        </div>

        {/* Content Input */}
        <div className="relative group">
          <label 
            htmlFor="content" 
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200 group-focus-within:text-blue-500 mb-2"
          >
            Content
          </label>
          <div className="relative">
            <div 
              className="prose dark:prose-invert max-w-none min-h-[200px] p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"
              dangerouslySetInnerHTML={{ __html: content }}
              contentEditable
              onInput={(e) => onContentChange(e.currentTarget.innerHTML)}
              onBlur={(e) => onContentChange(e.currentTarget.innerHTML)}
              suppressContentEditableWarning={true}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default PostEditor;
