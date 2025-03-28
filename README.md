# 📝 AI Blog Application

<div align="center">

<img src="frontend/public/Icon.png" alt="AI Blog App Banner" width="200" height="200" style="margin: 20px auto;">

A modern, AI-powered blog platform built with the MERN stack

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

🌐 **Live Demo:** [https://aiblogapp-vishalyadvaas.netlify.app/](https://aiblogapp-vishalyadvaas.netlify.app/)

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure user registration & login system |
| 📝 **Blog Management** | Create, edit, and delete blog posts |
| 👤 **User Profiles** | Customizable profiles with user stats |
| 🎨 **Dynamic Themes** | Light/dark mode support |
| 🤖 **AI Assistant** | AI-powered writing suggestions |
| 📱 **Responsive** | Works on all devices |
| 🔄 **Real-time** | Instant updates and notifications |

</div>

## 🚀 Tech Stack

<div align="center">

### 🎨 Frontend
```
React.js + Vite ⚡️ Redux Toolkit 🔄 React Router 🛣️ Tailwind CSS 🎯 Axios 🌐
```

### ⚙️ Backend
```
Node.js + Express.js 🚀 MongoDB 🍃 JWT 🔑 Cloudinary ☁️
```

</div>

## 📁 Project Structure

```
📦 aiBlogApp
├── 📂 backend                # Server code
│   ├── 📂 src
│   │   ├── ⚙️ config        # Configuration files
│   │   ├── 🎮 controllers   # Request handlers
│   │   ├── 🔒 middleware    # Custom middleware
│   │   ├── 📊 models       # Database models
│   │   ├── 🛣️ routes       # API routes
│   │   └── 🛠️ utils        # Utility functions
│   └── 📁 uploads          # File uploads
│
└── 📂 frontend             # Client application
    ├── 📂 public          # Static files
    └── 📂 src
        ├── 🏪 app         # Redux store
        ├── 🧩 components  # UI components
        ├── ⚡️ features    # Redux slices
        ├── 📐 layouts     # Layout components
        ├── 📄 pages       # Page components
        ├── 🛣️ router      # Routes config
        └── 🛠️ utils       # Utilities

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

1️⃣ Backend (.env)
```env
# Copy from .env.example
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

2️⃣ Frontend (.env)
```env
# Copy from .env.example
VITE_API_URL=http://localhost:5000/api
```

### 🚀 Launch Application

1️⃣ Start backend server
```bash
cd backend
npm run dev
```

2️⃣ Start frontend development server
```bash
cd frontend
npm run dev
```

🌐 Access the application:
- ✨ Frontend: `http://localhost:5173`
- 🚀 Backend API: `http://localhost:5000`

## 🔗 API Routes

### 🔐 Authentication
```http
POST /api/auth/register  # Register new user
POST /api/auth/login     # User login
```

### 📝 Posts
```http
GET    /api/posts       # Get all posts
POST   /api/posts       # Create new post
GET    /api/posts/:id   # Get single post
PUT    /api/posts/:id   # Update post
DELETE /api/posts/:id   # Delete post
```

### 👤 Users
```http
GET  /api/users/profile     # Get user profile
PUT  /api/users/profile     # Update profile
GET  /api/users/:id/posts   # Get user's posts
```

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌱 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💫 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 🚀 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">

Made with ❤️ by Vishal Yadav

</div>
