import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

const DEFAULT_PROMPTS = [
  "Write a blog post about technology trends",
  "Create an article about AI in everyday life",
  "Write about the future of social media",
  "Discuss the impact of blockchain technology",
];

// Generate content using Gemini API
const generateContent = async (prompt, options = {}) => {
  if (!API_KEY) {
    throw new Error('Gemini API key not found');
  }
  
  if (!prompt?.trim()) {
    throw new Error('Please provide a valid prompt');
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const formattedPrompt = formatPrompt(prompt, options);
    
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: formattedPrompt,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    
    if (!response?.text) throw new Error('No response generated from AI');
    return processResponse(response.text);
  } catch (error) {
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

// Helper to format prompt for better results
const formatPrompt = (prompt, options = {}) => {
  const { tone = 'professional', length = 'medium', format = 'blog' } = options;
  
  return `
    Write a ${format} post in a ${tone} tone, using these exact formatting rules:

    Formatting Requirements:
    1. Use **Section Name:** for main section headings
       Example: **Introduction:**

    2. Use *asterisks* for important terms
       Example: *artificial intelligence* is transforming industries

    3. For code blocks:
       - Always use triple backticks with appropriate language
       - Maintain proper indentation (4 spaces)
       - Put code blocks on new lines
       - Example:

       \`\`\`python
       def example_function():
           # This is a comment
           value = 42
           if value > 0:
               print("Positive")
           return value

       def another_example():
           data = {
               "key": "value",
               "numbers": [1, 2, 3]
           }
           return data
       \`\`\`

    4. For inline code:
       Use single backticks: \`variable_name\` or \`function()\`

    5. Use _underscores_ for emphasis
       Example: This is _very_ important

    6. Use bullet points with asterisk:
       * First point with *key term*
       * Second point with \`code\`
       * Third point with _emphasis_

    7. Use double newlines between sections and code blocks

    Topic: ${prompt}

    Format your response exactly as:
    TITLE: [Your title]
    CONTENT: [Your formatted content following the rules above]
  `.trim();
};

// Helper to process AI response
const processResponse = (content) => {
  if (!content) throw new Error('No content generated');

  // Extract title and content
  const titleMatch = content.match(/TITLE:\s*(.+?)(?=\n|$)/);
  const contentMatch = content.match(/CONTENT:\s*([\s\S]+)$/);

  if (!titleMatch || !contentMatch) {
    return { title: 'Generated Content', content: content.trim(), suggestions: [] };
  }

  const title = titleMatch[1].trim();
  let processedContent = contentMatch[1].trim();

  // Handle code blocks first (they might contain other markdown)
  const codeBlocks = new Map();
  let codeBlockCount = 0;
  processedContent = processedContent.replace(
    /```(\w+)?\n([\s\S]+?)\n```/g,
    (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlockCount}__`;
      
      // Preserve indentation and format code
      const formattedCode = code
        .split('\n')
        .map(line => {
          // Keep the original indentation
          const indent = line.match(/^\s*/)[0];
          const content = line.trim();
          return content ? indent + content : '';
        })
        .join('\n')
        .trim();

      codeBlocks.set(placeholder, `
        <div class="relative my-8">
          <div class="rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-900 shadow-lg">
            ${lang ? `
              <div class="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span class="text-sm font-medium text-gray-200">${lang}</span>
              </div>
            ` : ''}
            <div class="relative">
              <pre class="p-4 overflow-x-auto">
                <code class="text-sm font-mono text-gray-200 whitespace-pre block leading-6">${
                  formattedCode
                    .split('\n')
                    .map((line, index, array) => {
                      if (!line.trim()) return '';
                      // For first line or after empty line, ensure left alignment
                      if (index === 0 || !array[index - 1].trim()) {
                        return line.trimStart();
                      }
                      // Preserve relative indentation for other lines
                      const baseIndent = array[0].match(/^\s*/)[0].length;
                      const currentIndent = line.match(/^\s*/)[0].length;
                      const relativeIndent = currentIndent - baseIndent;
                      return ' '.repeat(Math.max(0, relativeIndent)) + line.trimStart();
                    })
                    .join('\n')
                }</code>
              </pre>
            </div>
          </div>
        </div>
      `.trim());
      codeBlockCount++;
      return placeholder;
    }
  );

  // Format inline elements helper
  const formatInline = (text) => {
    return text
      // Section headers
      .replace(/\*\*([^*]+?):\*\*/g, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">$1:</h2>')
      // Bold text
      .replace(/\*([^*\n]+?)\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
      // Inline code (excluding code blocks)
      .replace(/(?<!`)`([^`\n]+?)`(?!`)/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">$1</code>')
      // Italic text
      .replace(/\_([^_\n]+?)\_/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>');
  };

  // Process content blocks
  const blocks = processedContent.split(/\n\n+/);
  processedContent = blocks.map(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';

    // Restore code blocks
    if (trimmedBlock.startsWith('__CODE_BLOCK_')) {
      return codeBlocks.get(trimmedBlock);
    }

    // Handle bullet lists
    if (trimmedBlock.match(/^\* /m)) {
      const items = trimmedBlock.split(/\n/).map(line => {
        const listItem = line.replace(/^\* /, '').trim();
        return `<li class="ml-6 mb-2 text-gray-700 dark:text-gray-300">${formatInline(listItem)}</li>`;
      }).join('\n');
      return `<ul class="list-disc my-4 space-y-2">${items}</ul>`;
    }

    // Handle paragraphs with inline formatting
    const formattedText = formatInline(trimmedBlock);
    if (formattedText.startsWith('<h2')) return formattedText;
    
    return `<p class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">${formattedText}</p>`;
  }).join('\n');

  // Wrap in container
  processedContent = `<div class="prose dark:prose-invert max-w-none">${processedContent}</div>`;

  return {
    title,
    content: processedContent,
    suggestions: []
  };
};

const getSuggestedPrompts = () => {
  return DEFAULT_PROMPTS;
};

export {
  generateContent,
  formatPrompt,
  getSuggestedPrompts,
  DEFAULT_PROMPTS
};
