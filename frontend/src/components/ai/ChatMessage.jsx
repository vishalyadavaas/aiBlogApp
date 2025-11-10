import { FiUser, FiCpu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <FiCpu className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'} rounded-2xl px-4 py-3 shadow-sm`}>
        {message.parts?.map((part, i) => {
          switch (part.type) {
            case 'text':
              return (
                <div key={`${message.id}-${i}`} className="prose prose-sm dark:prose-invert max-w-none">
                  {isUser ? (
                    <p className="text-white m-0">{part.text}</p>
                  ) : (
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="text-sm" {...props} />,
                        div: ({node, ...props}) => <div className="text-sm" {...props} />,
                        span: ({node, ...props}) => <span className="text-sm" {...props} />
                      }}
                    >
                      {part.text}
                    </ReactMarkdown>
                  )}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
          <FiUser className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
