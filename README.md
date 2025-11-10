# 🤖 AI Blog Application

<div align="center">

<img src="frontend/public/Icon.png" alt="AI Blog App Banner" width="200" height="200" style="margin: 20px auto;">

A modern, intelligent blogging platform powered by AI and built with the MERN stack

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

</div>


## ✨ Features

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Authentication** | Secure JWT-based user registration & login with enhanced UI | ✅ |
| 📝 **Smart Content Creation** | AI-powered content generation using Google Gemini | ✅ |
| 🤖 **AI Chatbot Assistant** | Interactive AI chatbot for general help, coding assistance, and problem-solving | ✅ |
| 💬 **Real-time Chat Interface** | Beautiful chat UI with markdown support and syntax highlighting | ✅ |
| 🎨 **Code Syntax Highlighting** | Colorful code rendering with language-specific highlighting | ✅ |
| 📋 **Copy Code Feature** | One-click code copying from chat responses | ✅ |
| 👤 **User Profiles** | Customizable profiles with stats, followers, and posts | ✅ |
| 🎭 **Dynamic Themes** | Seamless light/dark mode with system preference detection | ✅ |
| 📱 **Mobile Responsive** | Optimized for all devices with modern touch interactions | ✅ |
| 💾 **Post Management** | Create, edit, delete with auto-save and draft support | ✅ |
| 🔄 **Real-time Updates** | Live post updates and user interaction feedback | ✅ |
| 🔍 **Smart Search** | AI-enhanced search across posts, users, and topics | ✅ |
| ❤️ **Social Features** | Like, save posts, follow users, and engagement tracking | ✅ |
| 🖼️ **Media Upload** | Cloudinary integration for image uploads and optimization | ✅ |
| 🚀 **Performance** | Optimized with lazy loading, caching, and modern build tools | ✅ |

</div>

## 🎯 What's New in Latest Version

### 🤖 **AI Integration**
- **Google Gemini Integration**: Advanced AI content generation
- **Interactive Chatbot**: Real-time AI assistant for any questions
- **Smart Problem Solving**: AI helps with coding, explanations, and general queries
- **Beautiful Chat Interface**: Modern UI with syntax highlighting
- **Code Assistance**: Colorful code blocks with copy functionality
- **Context-Aware Responses**: AI understands conversation context

### 🎨 **Enhanced UI/UX**
- **Modern Glassmorphism Design**: Beautiful translucent interfaces
- **Responsive Mobile Design**: Optimized for all screen sizes
- **Dynamic Theme System**: Intelligent light/dark mode switching
- **Smooth Animations**: Modern CSS animations and transitions
- **Enhanced Authentication Pages**: Beautiful login/register forms

### 📱 **Mobile Optimization**
- **Touch-Friendly Navigation**: Optimized for mobile interactions
- **Mobile Search Bar**: Improved mobile search experience
- **Responsive Components**: All components adapt to screen sizes
- **Performance Optimized**: Fast loading on mobile devices

### 🔧 **Technical Improvements**
- **Clean Codebase**: Removed unused files and components
- **Modern Architecture**: Latest React patterns and best practices
- **Enhanced State Management**: Optimized Redux implementation
- **Improved Error Handling**: Comprehensive error boundaries
- **Security Updates**: Latest security practices implemented

## 🚀 Tech Stack

<div align="center">

### 🎨 Frontend
```
React 18 ⚡️ Vite 5 🏗️ Redux Toolkit 🔄 React Router v6 🛣️ Tailwind CSS 🎯 
Axios 🌐 React Icons ✨ React Toastify 🔔 Framer Motion 🎭
```

### ⚙️ Backend
```
Node.js 🚀 Express.js 📡 MongoDB 🍃 Mongoose 📋 JWT 🔑 
Cloudinary ☁️ Multer 📁 bcryptjs 🔒 CORS 🌍
```

### 🤖 AI Integration
```
Google Gemini API 🧠 Vercel AI SDK 🔮 Stream Processing 🌊 
Context-Aware Chat 💬 Smart Content Generation ✍️
```

### 🛠️ Development Tools
```
ESLint 🔍 Prettier 💅 PostCSS 🎨 Autoprefixer 🔧 
VS Code Extensions 📝 Git Hooks 🪝
```

</div>

## 📁 Project Structure

```
📦 aiBlogApp
├── 📂 backend                    # Server-side application
│   ├── 📂 src
│   │   ├── ⚙️ config            # Database & Cloudinary config
│   │   ├── 🎮 controllers       # Business logic handlers
│   │   │   ├── authController.js
│   │   │   ├── postController.js
│   │   │   └── userController.js
│   │   ├── 🔒 middleware        # Authentication middleware
│   │   ├── 📊 models           # MongoDB schemas
│   │   │   ├── User.js
│   │   │   └── Post.js
│   │   ├── 🛣️ routes           # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── chatRoutes.js    # AI chat endpoints
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   └── 📁 uploads              # File upload directory
│       └── profiles/           # Profile pictures
│
└── 📂 frontend                  # Client-side application
    ├── 📂 public              # Static assets
    │   └── Icon.png           # App logo
    └── 📂 src                 # Source code
        ├── 🏪 app             # Redux store configuration
        ├── 🧩 components      # Reusable UI components
        │   ├── ai/           # AI chat components
        │   ├── common/       # Shared components
        │   ├── posts/        # Post-related components
        │   └── profile/      # Profile components
        ├── ⚡️ features        # Redux slices
        │   ├── auth/         # Authentication state
        │   ├── posts/        # Posts state
        │   └── theme/        # Theme state
        ├── 📐 layouts         # Layout components
        ├── 📄 pages          # Page components
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── CreatePostPage_AI.jsx
        │   ├── PostDetailsPage.jsx
        │   └── ProfilePage.jsx
        ├── 🛣️ router          # Routing configuration
        ├── 🛠️ utils           # Utility functions
        ├── index.css         # Global styles
        └── main.jsx          # App entry point

```

## 🛠️ Setup Instructions

### Prerequisites

- 📦 Node.js (v14 or higher)
- 🍃 MongoDB
- 📥 Git

### ⚡️ Quick Start

1️⃣ Clone the repository
```bash
git clone https://github.com/vishalyadavaas/aiBlogApp
cd aiBlogApp
```

2️⃣ Install dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 🔑 Environment Setup

1️⃣ **Backend Environment** (.env)
```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string
PORT=5001

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

2️⃣ **Frontend Environment** (.env)
```env
# Backend API URL
VITE_API_URL=http://localhost:5001

# Frontend URL
VITE_FRONTEND_URL=http://localhost:5173

# Google Gemini AI API Key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

### 🤖 AI Setup (Google Gemini)

1️⃣ **Get Gemini API Key**
- Visit [Google AI Studio](https://aistudio.google.com/)
- Create an account or sign in
- Generate an API key

2️⃣ **Add to Environment**
- Add your API key to frontend `.env` file
- Restart the development server

### 🚀 Launch Application

1️⃣ **Start Backend Server**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5001
```

2️⃣ **Start Frontend Development Server**
```bash
cd frontend
npm run dev
# App starts on http://localhost:5173
```

3️⃣ **Available Scripts**

**Backend Scripts:**
```bash
npm run dev        # Development with nodemon
npm start         # Production start
npm run lint      # ESLint check
```

**Frontend Scripts:**
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

🌐 **Access Points:**
- ✨ **Frontend App**: `http://localhost:5173`
- 🚀 **Backend API**: `http://localhost:5001`
- 📡 **API Documentation**: `http://localhost:5001/api`

### 🐛 Troubleshooting

**Common Issues:**

1️⃣ **Port Already in Use**
```bash
# Kill process on port 5001 (backend)
npx kill-port 5001

# Kill process on port 5173 (frontend)  
npx kill-port 5173
```

2️⃣ **MongoDB Connection Issues**
- Ensure MongoDB is running locally or
- Check your MongoDB Atlas connection string
- Verify network access in MongoDB Atlas

3️⃣ **AI Features Not Working**
- Verify `VITE_GEMINI_API_KEY` in frontend `.env`
- Check API key permissions in Google AI Studio
- Ensure you have sufficient API quota

## 🔗 API Documentation

### 🔐 Authentication Endpoints
```http
POST   /api/auth/register       # User registration
POST   /api/auth/login          # User login
GET    /api/auth/me             # Get current user
POST   /api/auth/refresh        # Refresh JWT token
```

### 📝 Posts Management
```http
GET    /api/posts               # Get all posts (with pagination)
POST   /api/posts               # Create new post
GET    /api/posts/:id           # Get single post
PUT    /api/posts/:id           # Update post (author only)
DELETE /api/posts/:id           # Delete post (author only)
POST   /api/posts/:id/like      # Toggle like on post
POST   /api/posts/:id/save      # Toggle save post
GET    /api/posts/search?q=     # Search posts
```

### 👤 User Management
```http
GET    /api/users/profile       # Get current user profile
PUT    /api/users/profile       # Update user profile
POST   /api/users/upload-avatar # Upload profile picture
GET    /api/users/:id           # Get user by ID
GET    /api/users/:id/posts     # Get user's posts
POST   /api/users/:id/follow    # Follow/unfollow user
GET    /api/users/:id/stats     # Get user statistics
```

### 🤖 AI Chat Endpoints
```http
POST   /api/chat/generate       # Generate AI content
POST   /api/chat/improve        # Improve existing content
POST   /api/chat/suggest        # Get writing suggestions
GET    /api/chat/models         # Get available AI models
```

### 📊 Request/Response Examples

**Create Post:**
```json
// POST /api/posts
{
  "title": "My Awesome Post",
  "content": "This is the content...",
  "tags": ["technology", "ai"],
  "featuredImage": "image_url"
}

// Response
{
  "success": true,
  "data": {
    "_id": "post_id",
    "title": "My Awesome Post",
    "content": "This is the content...",
    "author": {
      "_id": "user_id",
      "name": "User Name",
      "profilePic": "avatar_url"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "likes": [],
    "saved": []
  }
}
```

**AI Content Generation:**
```json
// POST /api/chat/generate
{
  "prompt": "Write a blog post about React hooks",
  "type": "blog_post",
  "tone": "professional"
}

// Response (Stream)
{
  "content": "React Hooks are a powerful feature...",
  "suggestions": ["Add code examples", "Include best practices"],
  "metadata": {
    "model": "gemini-pro",
    "tokens": 1250
  }
}
```

## 🎨 Screenshots

<div align="center">

### 🏠 Home Page
*Modern feed with AI-powered content discovery*
![Home Page](https://via.placeholder.com/800x450/1a202c/ffffff?text=Home+Page)

### 🤖 AI Writing Assistant
*Interactive AI chat for content creation*
![AI Assistant](https://via.placeholder.com/800x450/2d3748/ffffff?text=AI+Writing+Assistant)

### 📱 Mobile Experience
*Fully responsive design*
![Mobile View](https://via.placeholder.com/400x600/4a5568/ffffff?text=Mobile+View)

### 🎭 Dark/Light Themes
*Seamless theme switching*
![Themes](https://via.placeholder.com/800x300/718096/ffffff?text=Dark+%2F+Light+Themes)

</div>

## 🚀 Deployment

### 📡 Backend Deployment (Railway/Heroku)
```bash
# Build for production
npm run build

# Set environment variables
# Deploy using platform-specific commands
```

### 🌐 Frontend Deployment (Netlify/Vercel)
```bash
# Build for production
npm run build

# Deploy build folder
# Configure environment variables in platform dashboard
```

### 🔧 Environment Variables for Production
- Update API URLs to production endpoints
- Secure all secret keys
- Configure CORS for production domain
- Set up MongoDB Atlas for production database

## 📈 Performance

- ⚡ **Fast Loading**: Optimized bundle size with code splitting
- 🎯 **SEO Friendly**: Server-side rendering ready
- 📱 **Mobile Optimized**: 95+ Lighthouse performance score
- 🔄 **Efficient State**: Redux with RTK Query for caching
- 🖼️ **Image Optimization**: Cloudinary with automatic optimization

## 🔒 Security Features

- 🔐 **JWT Authentication**: Secure token-based auth
- 🛡️ **Input Validation**: Comprehensive data validation
- 🚫 **XSS Protection**: Sanitized user inputs
- 🔒 **CORS Configuration**: Secure cross-origin requests
- 🔑 **Password Hashing**: bcrypt for password security

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🛠️ Development Setup
1. 🍴 Fork the repository
2. 📥 Clone your fork: `git clone https://github.com/yourusername/aiBlogApp`
3. 🌱 Create feature branch: `git checkout -b feature/amazing-feature`
4. ⚙️ Install dependencies: `npm install` in both `/backend` and `/frontend`
5. 🔑 Set up environment variables (see setup section)

### 📝 Making Changes
1. 💫 Make your changes
2. ✅ Test your changes thoroughly
3. 📋 Follow the existing code style
4. 📚 Update documentation if needed

### 🚀 Submitting Changes
1. 💫 Commit your changes: `git commit -m 'Add amazing feature'`
2. 🚀 Push to branch: `git push origin feature/amazing-feature`
3. 🎉 Open a Pull Request with detailed description

### 🎯 Contribution Guidelines
- Follow existing code patterns and naming conventions
- Write clear commit messages
- Add tests for new features
- Update README if adding new functionality
- Ensure all tests pass before submitting PR

### 🐛 Reporting Issues
- Use the GitHub issue tracker
- Provide detailed description and reproduction steps
- Include screenshots for UI issues
- Specify your environment (OS, browser, versions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🤖 **Google Gemini** for AI capabilities
- 🎨 **Tailwind CSS** for styling framework
- 📚 **React Community** for amazing ecosystem
- 🚀 **Vite** for lightning-fast development
- 🔧 **Open Source Community** for inspiration and tools

## 📞 Contact & Support

<div align="center">

### 👨‍💻 Developer
**Vishal Yadav**

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=portfolio&logoColor=white)](https://vishalyadav.dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/vishalyadavaas)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vishalyadavaas)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/vishalyadavaas)

### 💬 Get Support
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/vishalyadavaas/aiBlogApp/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/vishalyadavaas/aiBlogApp/discussions)
- 📧 **Email**: [support@aiblogapp.com](mailto:support@aiblogapp.com)
- 💬 **Discord**: [Join our community](https://discord.gg/aiblogapp)

</div>

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**

Made with ❤️ and 🤖 by **Vishal Yadav**

*Empowering creators with AI-driven blogging*

</div>
