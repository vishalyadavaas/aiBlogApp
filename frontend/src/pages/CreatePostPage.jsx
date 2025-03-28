import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiCpu, FiLoader, FiFeather } from 'react-icons/fi';
import PostEditor from '../components/posts/PostEditor';
import CenteredLoader from '../components/common/CenteredLoader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { generatePostContent, createPost, getPosts, resetPage } from '../features/posts/postSlice';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      const resultAction = await dispatch(createPost(formData));
      if (createPost.fulfilled.match(resultAction)) {
        toast.success('Post created successfully!');
        // Reset page and refresh posts
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for AI generation');
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Clear any previous errors
      toast.dismiss();
      
      const resultAction = await dispatch(generatePostContent({ prompt }));
      
      if (generatePostContent.fulfilled.match(resultAction)) {
        const { title: generatedTitle, content: generatedContent } = resultAction.payload;
        
        // Only update if we got actual content back
        if (generatedTitle) setTitle(generatedTitle);
        if (generatedContent) setContent(generatedContent);
        
        setShowAIPrompt(false);
        toast.success('Content generated successfully!');
      } else if (generatePostContent.rejected.match(resultAction)) {
        // Get the specific error message from the action payload
        const errorMessage = resultAction.payload || resultAction.error.message;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      // Show a more detailed error message
      toast.error(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="relative">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiFeather className="w-8 h-8" />
              <span>Create Post</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share your thoughts with the world
            </p>
          </div>
          <button
            onClick={() => setShowAIPrompt(!showAIPrompt)}
            className="btn-secondary flex items-center space-x-2 hover-lift"
            disabled={isSubmitting}
          >
            <FiCpu className="w-5 h-5" />
            <span>AI Assistant</span>
          </button>
        </div>

        {/* AI Prompt Section */}
        {showAIPrompt && (
          <div className="mb-8 card p-6 animate-fadeIn">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  What would you like to write about?
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  AI can make mistakes. For theory blogs, you must mention the theory in the prompt. If you want code, you should also mention it in the prompt.
                </p>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Write a blog post about the future of AI and its impact on society..."
                  className="input-field min-h-[100px] transition-all duration-200 focus:shadow-lg"
                  disabled={isGenerating}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" light />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FiCpu className="w-5 h-5" />
                      <span>Generate Content</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Editor Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <PostEditor
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
              isSubmitting={isSubmitting}
              isGenerating={isGenerating}
            />
            {isGenerating && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <CenteredLoader />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary hover:scale-105 transition-transform duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isGenerating}
              className="btn-primary flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" light />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FiFeather className="w-5 h-5" />
                  <span>Publish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
