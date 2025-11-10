import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { 
  oneDark, 
  oneLight, 
  vscDarkPlus,
  atomDark,
  materialDark 
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';

// Enhanced Code block component with modern dark styling and AI-inspired design
const CodeBlock = ({ language, code, darkMode }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Select modern dark theme based on darkMode
  const getCodeTheme = () => {
    if (darkMode) {
      return vscDarkPlus; // Modern VS Code dark theme
    }
    return oneLight;
  };

  return (
    <div 
      className="relative group my-6 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced header with gradient background */}
      <div className={`relative px-4 py-3 ${darkMode 
        ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-black border-gray-700' 
        : 'bg-gradient-to-r from-gray-100 via-gray-50 to-white border-gray-200'
      } border-b flex items-center justify-between rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <FiCode className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-sm font-medium font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {language || 'code'}
          </span>
        </div>
        
        {/* Copy button with enhanced styling */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200 transform ${
            darkMode 
              ? `bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 ${isHovered ? 'opacity-100 scale-105' : 'opacity-80'}`
              : `bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 hover:shadow-md ${isHovered ? 'opacity-100 scale-105' : 'opacity-80'}`
          }`}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <FiCheck className="w-4 h-4 text-green-500" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Enhanced syntax highlighter with better dark styling and proper containment */}
      <div className={`relative ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} rounded-b-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={getCodeTheme()}
            language={language}
            PreTag="div"
            className="!mt-0 !mb-0 !rounded-none !bg-transparent"
            showLineNumbers
            wrapLongLines={true}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: darkMode ? '#6b7280' : '#9ca3af',
              userSelect: 'none',
              borderRight: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
              marginRight: '1em'
            }}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              maxWidth: '100%',
              overflowX: 'auto',
              wordBreak: 'break-word'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
        
        {/* Subtle gradient overlay for enhanced depth */}
        <div className={`absolute inset-0 pointer-events-none ${
          darkMode 
            ? 'bg-gradient-to-br from-transparent via-transparent to-blue-500/5'
            : 'bg-gradient-to-br from-transparent via-transparent to-blue-500/3'
        }`} />
      </div>
    </div>
  );
};

// Enhanced Markdown renderer with modern dark theme and AI-inspired design
const MarkdownResponse = memo(({ children, className = '', darkMode = false }) => {
  return (
    <div className={`
      prose prose-xl dark:prose-invert max-w-none w-full prose-container
      ${darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 border border-gray-700 shadow-2xl shadow-blue-500/10' 
        : 'bg-gradient-to-br from-white via-gray-50 to-blue-50/30 text-gray-900 border border-gray-200 shadow-xl'
      } 
      rounded-xl p-8 md:p-12 lg:p-16 backdrop-blur-sm overflow-hidden
      ${className}
    `}>
      <ReactMarkdown
        components={{
        // Customize code blocks with copy functionality
        // Customize pre blocks to handle multiple code blocks properly
        pre: ({ children, ...props }) => {
          // This ensures each pre block is treated separately
          return (
            <div className="my-6">
              {children}
            </div>
          );
        },
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : 'text';
          const code = String(children).replace(/\n$/, '');
          
          return !inline ? (
            <CodeBlock language={language} code={code} darkMode={darkMode} />
          ) : (
            <code 
              className={`
                px-2 py-1 rounded-md text-sm font-mono font-medium inline-block max-w-full
                ${darkMode 
                  ? 'bg-gray-800 text-cyan-300 border border-gray-600 shadow-lg'
                  : 'bg-pink-50 text-pink-700 border border-pink-200 shadow-sm'
                }
                transition-all duration-200 hover:scale-105 break-words
              `}
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              {...props}
            >
              {children}
            </code>
          );
        },
        // Enhanced headings with AI-inspired gradients and modern styling
        h1: ({ children }) => (
          <h1 className={`
            text-4xl md:text-5xl font-bold mt-8 mb-6 leading-tight
            ${darkMode 
              ? 'bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
            }
            drop-shadow-lg
          `}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={`
            text-3xl md:text-4xl font-bold mt-8 mb-4 pb-3 leading-tight
            ${darkMode ? 'text-gray-100' : 'text-gray-900'}
            border-b-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}
            relative
          `}>
            {children}
            <div className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`} />
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={`
            text-2xl md:text-3xl font-semibold mt-6 mb-3 
            ${darkMode ? 'text-gray-200' : 'text-gray-800'}
            relative pl-4
          `}>
            <div className={`absolute left-0 top-1 bottom-1 w-1 rounded-full ${
              darkMode 
                ? 'bg-gradient-to-b from-cyan-400 to-blue-500'
                : 'bg-gradient-to-b from-blue-500 to-purple-500'
            }`} />
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className={`
            text-xl md:text-2xl font-semibold mt-5 mb-2 
            ${darkMode ? 'text-gray-300' : 'text-gray-800'}
          `}>
            {children}
          </h4>
        ),
        // Enhanced links with modern hover effects and AI-inspired styling
        a: ({ children, href }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`
              font-medium underline underline-offset-4 decoration-2 transition-all duration-300
              ${darkMode 
                ? 'text-cyan-400 decoration-cyan-400/60 hover:text-cyan-300 hover:decoration-cyan-300 hover:shadow-cyan-400/20'
                : 'text-blue-600 decoration-blue-500/60 hover:text-blue-700 hover:decoration-blue-600 hover:shadow-blue-500/20'
              }
              hover:shadow-lg rounded-sm px-1 -mx-1
            `}
          >
            {children}
          </a>
        ),
        // Enhanced unordered lists with better spacing
        ul: ({ children }) => (
          <ul className="list-none space-y-3 my-6">
            {children}
          </ul>
        ),
        // Enhanced list items with modern bullets and improved styling
        li: ({ children, ordered }) => {
          if (ordered) {
            return (
              <li className={`ml-6 leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {children}
              </li>
            );
          }
          return (
            <li className={`flex items-start gap-4 leading-relaxed group ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span className={`
                mt-2 w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-125
                ${darkMode 
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/30'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30'
                }
              `} />
              <span className="flex-1">{children}</span>
            </li>
          );
        },
        // Enhanced ordered lists with better styling
        ol: ({ children }) => (
          <ol className={`list-decimal list-inside space-y-3 my-6 ml-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {children}
          </ol>
        ),
        // Enhanced blockquotes with modern AI-inspired styling
        blockquote: ({ children }) => (
          <blockquote className={`
            relative my-6 p-6 rounded-xl italic font-medium
            ${darkMode 
              ? 'bg-gradient-to-r from-gray-800/80 via-gray-700/60 to-gray-800/80 text-gray-200 border-l-4 border-cyan-400 shadow-xl shadow-cyan-400/10'
              : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-gray-800 border-l-4 border-blue-500 shadow-lg'
            }
            backdrop-blur-sm
          `}>
            <div className={`absolute top-4 left-4 text-3xl opacity-30 ${
              darkMode ? 'text-cyan-400' : 'text-blue-500'
            }`}>
              "
            </div>
            <div className="relative z-10 pl-6">
              {children}
            </div>
          </blockquote>
        ),
        // Enhanced paragraphs with better typography
        p: ({ children }) => (
          <p className={`
            my-5 leading-relaxed text-base md:text-lg
            ${darkMode ? 'text-gray-300' : 'text-gray-700'}
          `}>
            {children}
          </p>
        ),
        // Enhanced horizontal rules with gradient styling
        hr: () => (
          <div className="my-8 flex items-center justify-center">
            <div className={`h-px w-full rounded-full ${
              darkMode 
                ? 'bg-gradient-to-r from-transparent via-gray-600 to-transparent'
                : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
            }`} />
          </div>
        ),
        // Enhanced tables with modern styling
        table: ({ children }) => (
          <div className="overflow-x-auto my-8 rounded-xl shadow-xl">
            <table className={`min-w-full divide-y ${
              darkMode 
                ? 'divide-gray-600 border border-gray-600 bg-gray-800/50'
                : 'divide-gray-200 border border-gray-200 bg-white'
            } rounded-xl overflow-hidden backdrop-blur-sm`}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className={darkMode 
            ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800'
            : 'bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50'
          }>
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className={`divide-y ${
            darkMode 
              ? 'bg-gray-900/50 divide-gray-700'
              : 'bg-white divide-gray-200'
          }`}>
            {children}
          </tbody>
        ),
        th: ({ children }) => (
          <th className={`px-6 py-4 text-left text-sm font-bold uppercase tracking-wider ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className={`px-6 py-4 text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {children}
          </td>
        ),
        // Enhanced images with modern styling
        img: ({ src, alt }) => (
          <div className="my-8 flex justify-center">
            <img 
              src={src} 
              alt={alt} 
              className={`rounded-xl shadow-2xl max-w-full h-auto transition-transform duration-300 hover:scale-105 ${
                darkMode ? 'shadow-cyan-500/20' : 'shadow-blue-500/20'
              }`}
              loading="lazy"
            />
          </div>
        ),
        // Enhanced strong/bold text
        strong: ({ children }) => (
          <strong className={`font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {children}
          </strong>
        ),
        // Enhanced emphasis/italic text
        em: ({ children }) => (
          <em className={`italic font-medium ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {children}
          </em>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
    </div>
  );
});

MarkdownResponse.displayName = 'MarkdownResponse';

export default MarkdownResponse;
