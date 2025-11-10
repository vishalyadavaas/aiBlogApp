import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiCpu, FiFeather, FiSend, FiZap, FiRefreshCw, FiEdit3, FiType } from 'react-icons/fi';
import MarkdownResponse from '../components/common/MarkdownResponse';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { createPost, getPosts, resetPage } from '../features/posts/postSlice';
import { users } from '../utils/api';

const getAuthToken = () => localStorage.getItem('token');

const CreatePostPage_AI = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);

  const { mode: themeMode } = useSelector(state => state.theme) || { mode: 'light' };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Simple manual implementation instead of useChat
  const [isGenerating, setIsGenerating] = useState(false);

  const sendChatMessage = async (prompt) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login to use AI generation');
      throw new Error('No authentication token found');
    }

    const messages = [
      {
        role: 'user',
        parts: [{ type: 'text', text: prompt }]
      }
    ];

    console.log('📤 Sending messages:', messages);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: messages,
        id: `chat-${Date.now()}`
      }),
    });

    console.log('📨 Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate content');
    }

    // Check if response has a body
    if (!response.body) {
      throw new Error('No response body available');
    }

    // Handle streaming response
    console.log('🔄 Starting to read text stream...');
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    let generatedContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ Stream reading completed');
          break;
        }
        
        // Decode the chunk as plain text
        const chunk = decoder.decode(value, { stream: true });
        console.log('📦 Received text chunk:', chunk);
        
        // Add chunk to content
        generatedContent += chunk;
        setContent(generatedContent);
      }
      
      console.log('✅ Final generated content length:', generatedContent.length);
      return generatedContent;
    } finally {
      reader.releaseLock();
    }
  };

  // Watch for content changes and extract title
  useEffect(() => {
    if (content && !isGenerating) {
      // Extract title from first heading
      if (!title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          setTitle(titleMatch[1]);
        }
      }
      
      toast.success('✨ Content generated successfully!');
      setShowPreview(true);
    }
  }, [content, isGenerating, title]);

  const handleAutoPublish = async (generatedTitle, generatedContent) => {
    if (!generatedTitle.trim() || !generatedContent.trim()) {
      toast.error('Failed to generate valid content');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info('📤 Publishing your post...');
      
      const formData = new FormData();
      formData.append('title', generatedTitle);
      formData.append('content', generatedContent);

      const resultAction = await dispatch(createPost(formData));
      if (createPost.fulfilled.match(resultAction)) {
        toast.success('🎉 Post published successfully!');
        await dispatch(resetPage());
        await dispatch(getPosts({ page: 1 }));
        setTimeout(() => navigate('/'), 1000);
      } else {
        throw new Error(resultAction.error.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
      setAutoPublish(false);
    }
  };

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await users.getStats();
        setUserStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a topic or description for your blog post');
      return;
    }
    
    try {
      setTitle('');
      setContent('');
      setShowPreview(false);
      setAutoPublish(false);
      setIsGenerating(true);
      
      toast.info('🤖 AI is generating your content...');
      
      await sendChatMessage(prompt);
      
    } catch (error) {
      console.error('Content generation failed:', error);
      toast.error(error.message || 'Failed to generate content. Please try again.');
      setAutoPublish(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (prompt.trim()) {
      setTitle('');
      setContent('');
      setShowPreview(false);
      setAutoPublish(false);
      setIsGenerating(true);
      
      try {
        await sendChatMessage(prompt);
        toast.info('🤖 Content regenerated successfully!');
      } catch (error) {
        console.error('Content generation failed:', error);
        toast.error(error.message || 'Failed to regenerate content.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please generate or fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      const resultAction = await dispatch(createPost(formData));
      if (createPost.fulfilled.match(resultAction)) {
        toast.success('🎉 Post published successfully!');
        await dispatch(resetPage());
        await dispatch(getPosts({ page: 1 }));
        navigate('/');
      } else {
        throw new Error(resultAction.error.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptSuggestions = [
    "Write a comprehensive guide about React hooks and their use cases",
    "Create a tutorial on building REST APIs with Node.js and Express",
    "Explain machine learning concepts for beginners with examples",
    "Write about the latest trends in web development for 2025",
    "Create a guide on TypeScript best practices and patterns",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fadeIn">
      <div className="relative">
        {/* Header Section */}
        <div className="mb-6 relative">
          <div className="relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm shadow-lg border border-purple-200/50 dark:border-purple-700/50">
            <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <FiCpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                    AI-Powered Blog Creator
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Let AI generate amazing content for your blog posts
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-700/30">
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-6 w-8 mx-auto rounded"></div>
                    ) : (
                      userStats?.userPosts || 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Your Posts</div>
                </div>
                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-700/30">
                  <div className="text-xl font-bold text-pink-600 dark:text-pink-400">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-6 w-8 mx-auto rounded"></div>
                    ) : (
                      userStats?.savedPosts || 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Saved</div>
                </div>
                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-700/30">
                  <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-6 w-8 mx-auto rounded"></div>
                    ) : (
                      userStats?.totalLikesReceived || 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generation Section */}
        <div className="mb-6">
          <div className="relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-lg animate-float"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                  <FiZap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  What would you like to write about?
                </h3>
              </div>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-3">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Describe your blog post topic or provide instructions
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Write a comprehensive guide about React hooks, including useState, useEffect, and custom hooks with practical examples..."
                    className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-purple-200/50 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] resize-none"
                    disabled={isGenerating}
                  />
                  
                  {/* Quick Suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {promptSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setPrompt(suggestion)}
                          className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full transition-all duration-200 hover:scale-105"
                          disabled={isGenerating}
                        >
                          {suggestion.substring(0, 40)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  {content && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isGenerating || isSubmitting || !prompt.trim()}
                    className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[200px]"
                  >
                    {isGenerating || isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" light />
                        <span>{isSubmitting ? 'Publishing...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <FiZap className="w-4 h-4" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Generated Content Section */}
        {(content || isGenerating) && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            <div className="relative p-6 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Loading Overlay */}
              {(isGenerating || isSubmitting) && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-20 backdrop-blur-sm rounded-2xl">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <LoadingSpinner size="lg" />
                      <div className="absolute inset-0 border-2 border-purple-200 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {isSubmitting ? '📤 Publishing your post...' : '🤖 AI is crafting your content...'}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Title Field */}
                <div className="relative group">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiType className="w-5 h-5 text-purple-500" />
                    <label 
                      htmlFor="title" 
                      className="block text-lg font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Post Title
                    </label>
                  </div>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Your post title will appear here..."
                    className="w-full px-6 py-4 text-xl font-medium border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    disabled={isSubmitting || isGenerating}
                    required
                  />
                </div>

                {/* Content Preview/Edit Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FiEdit3 className="w-5 h-5 text-pink-500" />
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Post Content
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>

                {/* Content Area */}
                {showPreview ? (
                  <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 min-h-[300px] p-1 overflow-hidden">
                    <MarkdownResponse darkMode={themeMode === 'dark'} className="!border-0 !shadow-none !bg-transparent !p-4 !max-w-none">
                      {content}
                    </MarkdownResponse>
                  </div>
                ) : (
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Your AI-generated content will appear here..."
                    rows={16}
                    className="w-full px-6 py-4 text-base leading-relaxed border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 resize-none font-mono"
                    disabled={isSubmitting || isGenerating}
                    required
                  />
                )}

                {/* Character Count */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Characters: {content?.length || 0}</span>
                  <span>Words: {content ? content.split(/\s+/).filter(word => word.length > 0).length : 0}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-md"
                disabled={isSubmitting || isGenerating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isGenerating || !title.trim() || !content.trim()}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" light />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Empty State */}
        {!content && !isGenerating && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-float shadow-lg">
                <FiFeather className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
                Ready to Create?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Describe what you want to write about and let AI generate amazing content for you. You can edit it before publishing!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostPage_AI;
