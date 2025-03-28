# AI Blog App Backend

A RESTful API backend for the AI Blog App built with Node.js, Express, and MongoDB.

## Features

- User Authentication (JWT)
- Post Management
- Social Features (Follow, Like, Comment)
- Notifications System
- Profile Management
- File Upload Support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aiBlogApp
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Posts
- `POST /api/posts` - Create a post (Protected)
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (Protected)
- `DELETE /api/posts/:id` - Delete post (Protected)
- `POST /api/posts/:id/like` - Like/Unlike post (Protected)
- `POST /api/posts/:id/comment` - Add comment (Protected)
- `DELETE /api/posts/:id/comment/:commentId` - Delete comment (Protected)

### Users
- `PUT /api/users/profile` - Update profile (Protected)
- `DELETE /api/users/profile` - Delete account (Protected)
- `POST /api/users/follow/:userId` - Follow user (Protected)
- `POST /api/users/unfollow/:userId` - Unfollow user (Protected)
- `GET /api/users/:userId/followers` - Get user's followers (Protected)
- `GET /api/users/:userId/following` - Get user's following (Protected)
- `POST /api/users/posts/:postId/save` - Save/unsave post (Protected)
- `GET /api/users/saved` - Get saved posts (Protected)

### Notifications
- `GET /api/notifications` - Get user notifications (Protected)
- `GET /api/notifications/unread/count` - Get unread count (Protected)
- `PUT /api/notifications/mark-all-read` - Mark all as read (Protected)
- `DELETE /api/notifications/:id` - Delete notification (Protected)
- `DELETE /api/notifications` - Delete all notifications (Protected)

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── userController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── userRoutes.js
│   │   └── notificationRoutes.js
│   └── server.js
├── uploads/
│   └── profiles/
├── .env
└── package.json
```

## Security Features

- Password hashing (bcrypt)
- JWT authentication
- Rate limiting
- Security headers (helmet)
- Input validation
- CORS enabled

## Development

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
