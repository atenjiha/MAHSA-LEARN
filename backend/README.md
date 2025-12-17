# MAHSA Backend

MongoDB backend server for the MAHSA microlearning application.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env` and add your MongoDB connection string:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mahsa_db
PORT=5000
NODE_ENV=development
```

### 3. Get MongoDB Connection String
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free account and cluster
- Click "Connect" → "Drivers" → copy the connection string
- Replace `<username>`, `<password>`, and `<dbname>` in the string

### 4. Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Health Check
- `GET /api/health` - Server health status

## Build for Production
```bash
npm run build
npm start
```

## Folder Structure
```
src/
├── server.ts          # Main server file
├── models/
│   ├── User.ts        # User schema
│   └── Course.ts      # Course schema
└── routes/
    ├── users.ts       # User endpoints
    └── courses.ts     # Course endpoints
```
