import { useRef, useEffect } from 'react';
import { FiMessageSquare, FiCpu } from 'react-icons/fi';
import ChatMessage from './ChatMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatConversation = ({ messages, status }) => {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
      style={{ maxHeight: '500px', minHeight: '300px' }}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4">
            <FiMessageSquare className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Start a Conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Ask AI to help you write blog content, generate ideas, or create code examples
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {(status === 'streaming' || status === 'submitted') && (
            <div className="flex gap-3 justify-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <FiCpu className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatConversation;
