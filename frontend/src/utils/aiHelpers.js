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
    return processResponse(response.text, options.format || 'text-only');
  } catch (error) {
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

// Helper to format prompt for better results
const formatPrompt = (prompt, options = {}) => {
  const { tone = 'professional', length = 'medium', format = 'text-only' } = options;
  
  let formatInstructions = '';
  
  switch (format) {
    case 'text-only':
      formatInstructions = `
      Create clean, readable text with these guidelines:
      - Use clear section headings without special formatting
      - Write in complete sentences with proper paragraphs
      - Use simple bullet points with dashes (-)
      - Keep code examples simple and minimal
      - Focus on clear explanations over fancy formatting
      - Use double line breaks between sections
      - Avoid HTML, markdown, or special symbols
      `;
      break;
      
    case 'code-only':
      formatInstructions = `
      Focus heavily on technical content:
      - Include multiple code examples with proper syntax
      - Use code blocks with language specification
      - Provide step-by-step technical instructions
      - Include inline code references frequently
      - Add technical comments and explanations
      - Use programming best practices
      `;
      break;
      
    case 'tutorial':
      formatInstructions = `
      Create a step-by-step tutorial format:
      - Number each major step clearly
      - Include code examples for each step
      - Add "Note:" and "Tip:" sections
      - Use clear section headings
      - Include prerequisites and setup instructions
      - Add troubleshooting sections
      `;
      break;
      
    case 'mixed':
    default:
      formatInstructions = `
      Create rich, well-formatted content:
      - Use clear section headings with proper formatting
      - Include code blocks where relevant
      - Add bullet points for lists
      - Use emphasis for important terms
      - Include examples and explanations
      - Balance text and technical content
      `;
      break;
  }

  return `
    Write a comprehensive article about: ${prompt}
    
    Tone: ${tone}
    Length: ${length}
    
    ${formatInstructions}
    
    Format your response as:
    TITLE: [Your title]
    CONTENT: [Your content following the guidelines above]
  `.trim();
};

// Helper to process AI response
const processResponse = (content, format = 'text-only') => {
  if (!content) throw new Error('No content generated');

  // Extract title and content
  const titleMatch = content.match(/TITLE:\s*(.+?)(?=\n|$)/);
  const contentMatch = content.match(/CONTENT:\s*([\s\S]+)$/);

  if (!titleMatch || !contentMatch) {
    return { title: 'Generated Content', content: content.trim(), suggestions: [] };
  }

  const title = titleMatch[1].trim();
  let processedContent = contentMatch[1].trim();

  // For text-only format, keep it simple and clean
  if (format === 'text-only') {
    processedContent = processedContent
      // Clean up any markdown or HTML
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Handle section headers simply
      .replace(/^#+\s*(.+)$/gm, '\n$1\n' + '='.repeat(20) + '\n')
      // Handle bullet points
      .replace(/^\s*[-*]\s+(.+)$/gm, '• $1')
      // Clean up extra whitespace while preserving paragraph breaks
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    
    return {
      title,
      content: processedContent,
      suggestions: []
    };
  }

  // For other formats, use the existing rich formatting
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
