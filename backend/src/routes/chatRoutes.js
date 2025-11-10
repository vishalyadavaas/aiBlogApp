const express = require('express');
const router = express.Router();
const { streamText, convertToModelMessages } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { requireAuth } = require('../middleware/auth');

// Initialize Google Gemini with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

// Allow streaming responses up to 30 seconds
const maxDuration = 30;

// POST /api/chat - Stream blog content generation
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('📝 Raw request body:', JSON.stringify(req.body, null, 2));
    
    // DefaultChatTransport v5 sends: { messages: [...], id: '...' }
    const { messages, id } = req.body;

    console.log('📨 Extracted data:', { 
      messagesCount: messages?.length,
      chatId: id,
      userId: req.user?._id,
      firstMessage: messages?.[0]
    });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('❌ Invalid messages format');
      return res.status(400).json({
        success: false,
        message: 'Invalid messages format - expected array of messages'
      });
    }

    console.log('🤖 Starting AI generation with Gemini...');

    const instruction = `You are a professional blog writer. Generate well-structured, engaging blog posts in markdown format.

IMPORTANT: Start your response with a single # heading for the title (e.g., "# Understanding Machine Learning").

Structure:
- # Title (H1 heading at the very beginning)
- ## Section headings (H2)
- ### Subsection headings (H3) if needed
- Well-organized paragraphs
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- Bullet points for lists
- Code blocks with \`\`\`language when showing code
- > blockquotes for important notes
- Relevant examples when appropriate

Make the content informative, engaging, and easy to read. Write in markdown format.
Use Google Search when you need current information, latest news, or up-to-date facts.`;

    // Set up streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log('🌊 Starting stream response');

    try {
      // Generate blog content with streaming using Google Gemini
      const result = streamText({
        model: google('gemini-2.0-flash-exp'),
        messages: convertToModelMessages(messages),
        system: instruction,
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        maxTokens: 2000,
        temperature: 0.7,
      });

      // Stream the text directly to response
      for await (const textPart of result.textStream) {
        console.log('📝 Streaming part:', textPart);
        res.write(textPart);
      }

      console.log('✅ Streaming completed');
      res.end();

    } catch (streamError) {
      console.error('❌ Stream error:', streamError);
      res.write('\n\nError: Failed to generate content. Please try again.');
      res.end();
    }
  } catch (error) {
    console.error('❌ Chat streaming error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating content',
      error: error.message 
    });
  }
});

module.exports = router;
