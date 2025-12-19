import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import coursesRouter from './routes/courses';
import badgesRouter from './routes/badges';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || '';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch((err) => console.error('✗ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MAHSA Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      courses: '/api/courses',
      badges: '/api/badges',
      health: '/api/health'
    }
  });
});

app.use('/api/users', usersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/badges', badgesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
