import { useState } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';

const ChatInput = ({ onSubmit, status, placeholder = "Ask AI to help you write..." }) => {
  const [input, setInput] = useState('');
  const isDisabled = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isDisabled) {
      onSubmit(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative flex items-center gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={2}
          className="flex-1 px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isDisabled || !input.trim()}
          className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isDisabled ? (
            <FiLoader className="w-5 h-5 animate-spin" />
          ) : (
            <FiSend className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
};

export default ChatInput;
