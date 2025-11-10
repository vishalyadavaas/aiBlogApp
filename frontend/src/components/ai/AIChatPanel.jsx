import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { FiCpu, FiX, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ChatConversation from './ChatConversation';
import ChatInput from './ChatInput';

const getAuthToken = () => localStorage.getItem('token');

const AIChatPanel = ({ onContentGenerated, onClose }) => {
  const [copiedToEditor, setCopiedToEditor] = useState(false);

  const { messages, sendMessage, status, error } = useChat({
    api: `${import.meta.env.VITE_API_URL}/api/chat`,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error(`Failed to generate content: ${error.message}`);
    },
  });

  // Extract generated content and pass to parent
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role === 'assistant') {
        const textContent = lastMessage.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join('');
        
        if (textContent && status === 'ready') {
          // Extract title from first heading
          const titleMatch = textContent.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : '';
          
          onContentGenerated({
            title,
            content: textContent,
          });
        }
      }
    }
  }, [messages, status, onContentGenerated]);

  const handleSendMessage = (text) => {
    sendMessage({ text });
  };

  const handleCopyToEditor = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const textContent = lastMessage.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('');
      
      const titleMatch = textContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : '';
      
      onContentGenerated({
        title,
        content: textContent,
      });
      
      setCopiedToEditor(true);
      toast.success('Content copied to editor!');
      
      setTimeout(() => {
        setCopiedToEditor(false);
      }, 2000);
    }
  };

  const handleRegenerate = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages
        .filter(m => m.role === 'user')
        .pop();
      
      if (lastUserMessage) {
        const text = lastUserMessage.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join('');
        
        if (text) {
          sendMessage({ text });
        }
      }
    }
  };

  const suggestions = [
    "Write a comprehensive guide about React hooks",
    "Create a tutorial on building REST APIs with Node.js",
    "Explain machine learning concepts for beginners",
    "Write about the latest trends in web development",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <FiCpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Content Generator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask AI to help you write amazing blog content
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <ChatConversation messages={messages} status={status} />
          
          {/* Suggestions (only show when no messages) */}
          {messages.length === 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Try these suggestions:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={status === 'streaming' || status === 'submitted'}
                    className="text-left text-sm px-3 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <ChatInput
            onSubmit={handleSendMessage}
            status={status}
            placeholder="Ask AI to write a blog post about..."
          />
        </div>

        {/* Action Buttons */}
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && status === 'ready' && (
          <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleCopyToEditor}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
            >
              {copiedToEditor ? (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4" />
                  <span>Copy to Editor</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleRegenerate}
              disabled={status === 'streaming' || status === 'submitted'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPanel;
