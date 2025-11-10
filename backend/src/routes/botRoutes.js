const express = require('express');
const router = express.Router();
const { streamText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { requireAuth } = require('../middleware/auth');

// Initialize Google Gemini with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

// Allow streaming responses up to 30 seconds
const maxDuration = 30;

// POST /api/bot - Stream chatbot responses
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('🤖 Raw chatbot request body:', JSON.stringify(req.body, null, 2));
    
    // DefaultChatTransport v5 sends: { messages: [...], id: '...' }
    const { messages, id } = req.body;

    console.log('💬 Extracted chatbot data:', { 
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

    console.log('🤖 Starting AI chatbot generation with Gemini...');

    // Filter and clean messages for the AI model
    // Only include valid user and assistant messages, exclude error messages
    const cleanMessages = messages
      .filter(msg => {
        // Only include messages with valid content
        return msg.role && msg.content && 
               typeof msg.content === 'string' && 
               msg.content.trim() !== '' &&
               !msg.content.includes('Sorry, I encountered an error');
      })
      .map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      }));

    console.log('🧹 Cleaned messages:', cleanMessages);

    if (cleanMessages.length === 0) {
      console.log('❌ No valid messages found');
      return res.status(400).json({
        success: false,
        message: 'No valid messages to process'
      });
    }

    const instruction = `You are a helpful, friendly, and knowledgeable AI assistant chatbot. Your goal is to provide accurate, helpful, and engaging responses to users.

Personality:
- Be conversational and approachable
- Show empathy when appropriate
- Be concise but informative
- Use emojis sparingly but effectively
- Ask follow-up questions when helpful

Capabilities:
- Answer questions on a wide range of topics
- Provide explanations and tutorials
- Help with problem-solving
- Offer suggestions and recommendations
- Engage in casual conversation

Response style:
- Keep responses clear and well-structured
- Use bullet points or numbered lists when appropriate
- Provide examples when helpful
- Be honest if you don't know something
- Suggest alternatives when possible

Important: Respond in a natural, conversational manner. You are a helpful AI assistant ready to chat about anything the user needs help with.`;

    // Set up streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log('🌊 Starting chatbot stream response');

    try {
      // Generate chatbot response with streaming using Google Gemini
      const result = streamText({
        model: google('gemini-2.5-flash-lite'),
        messages: cleanMessages,
        system: instruction,
        maxTokens: 2000,
        temperature: 0.7,
      });

      // Stream the text directly to response
      for await (const textPart of result.textStream) {
        console.log('💬 Streaming chatbot part:', textPart);
        res.write(textPart);
      }

      console.log('✅ Chatbot streaming completed');
      res.end();

    } catch (streamError) {
      console.error('❌ Chatbot stream error:', streamError);
      res.write('\n\nSorry, I encountered an error. Please try again! 😅');
      res.end();
    }
  } catch (error) {
    console.error('❌ Chatbot streaming error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating chatbot response',
      error: error.message 
    });
  }
});

module.exports = router;