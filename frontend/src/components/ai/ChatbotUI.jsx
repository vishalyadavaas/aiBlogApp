import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageCircle, FiUser, FiCpu, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatbotUI = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat cleared!');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!input?.trim() || isLoading) return;
    
    const userMessage = { 
      role: 'user', 
      content: input.trim(), 
      id: Date.now().toString() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }
      
      const response = await fetch('http://localhost:5001/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({ 
            role: msg.role, 
            content: msg.content 
          })),
          id: Date.now().toString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessage = { 
        role: 'assistant', 
        content: '', 
        id: (Date.now() + 1).toString() 
      };
      
      const messagesWithAssistant = [...newMessages, assistantMessage];
      setMessages(messagesWithAssistant);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value, { stream: true });
        assistantMessage = {
          ...assistantMessage,
          content: assistantMessage.content + text
        };
        
        setMessages([...newMessages, assistantMessage]);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[85vh] mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <FiCpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <p className="text-sm text-white/80">Ask me anything - I'm here to help!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Clear chat"
            >
              <FiMessageCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Close chat"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-float shadow-lg">
                <FiCpu className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Hello! I'm your AI assistant
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                I can help you with questions, explanations, problem-solving, and much more. 
                Feel free to ask me anything! 😊
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              onCopy={handleCopyMessage}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start animate-slideIn">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    <FiCpu className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-base text-gray-600 dark:text-gray-400">AI is thinking</span>
                      <div className="flex space-x-1 ml-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center min-w-[48px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-medium">Enter</kbd> to send • 
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-medium">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Message Component with Markdown Support
const ChatMessage = ({ message, onCopy, style }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slideIn group`}
      style={style}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 relative ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isUser 
              ? 'bg-white/20' 
              : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
          }`}>
            {isUser ? (
              <FiUser className="w-4 h-4" />
            ) : (
              <FiCpu className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isUser ? (
              <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-base max-w-none dark:prose-invert prose-blue">
                <ReactMarkdown
                  components={{
                    // Code blocks
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : 'text';
                      const codeContent = String(children).replace(/\n$/, '');
                      
                      // Only render as code block if it's explicitly marked as code or has specific patterns
                      if (!inline && (className || codeContent.includes('\n') || codeContent.length > 50)) {
                        return (
                          <div className="relative group/code my-4">
                            <div className="absolute top-3 right-3 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded z-10 font-medium">
                              {language}
                            </div>
                            <button
                              onClick={() => onCopy(codeContent)}
                              className="absolute top-3 left-3 opacity-0 group-hover/code:opacity-100 transition-opacity p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 z-10"
                              title="Copy code"
                            >
                              <FiCopy className="w-3.5 h-3.5" />
                            </button>
                            <SyntaxHighlighter
                              language={language}
                              style={oneDark}
                              className="rounded-xl border border-gray-700 text-sm"
                              customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: '#1a1b26',
                                borderRadius: '0.75rem'
                              }}
                              codeTagProps={{
                                style: {
                                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                                }
                              }}
                            >
                              {codeContent}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      
                      return (
                        <code
                          className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-2 py-1 rounded text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    // Paragraphs
                    p({ children }) {
                      return <p className="mb-3 last:mb-0 leading-relaxed text-base">{children}</p>;
                    },
                    // Lists
                    ul({ children }) {
                      return <ul className="list-disc pl-5 mb-3 space-y-2 text-base">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-5 mb-3 space-y-2 text-base">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="leading-relaxed">{children}</li>;
                    },
                    // Headings
                    h1({ children }) {
                      return <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{children}</h3>;
                    },
                    // Blockquotes
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg mb-4 italic text-base">
                          {children}
                        </blockquote>
                      );
                    },
                    // Links
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                        >
                          {children}
                        </a>
                      );
                    },
                    // Tables
                    table({ children }) {
                      return (
                        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 mb-3 rounded-lg overflow-hidden">
                          {children}
                        </table>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                          {children}
                        </td>
                      );
                    },
                    // Strong/Bold
                    strong({ children }) {
                      return <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>;
                    },
                    // Emphasis/Italic
                    em({ children }) {
                      return <em className="italic">{children}</em>;
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        
        {/* Copy button for assistant messages */}
        {!isUser && (
          <button
            onClick={() => onCopy(message.content)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
            title="Copy message"
          >
            <FiCopy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatbotUI;