import mongoose from 'mongoose';

// QuizAttempt subdocument schema
const quizAttemptSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  slideId: { type: String, required: true },
  question: { type: String, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timestamp: { type: Number, required: true }
}, { _id: false }); // No separate _id for subdocuments

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  pin: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^\d{4}$/.test(v);
      },
      message: 'PIN must be exactly 4 digits'
    }
  },
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ['Nurse', 'Educator'],
    required: true
  },
  avatar: { type: String, default: '' },
  xp: { type: Number, default: 0, min: 0 },
  streak: { type: Number, default: 0, min: 0 },
  badges: { type: [String], default: [] },
  completedCourses: { type: [String], default: [] },
  quizAttempts: { type: [quizAttemptSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Index for faster queries
userSchema.index({ role: 1 });
userSchema.index({ xp: -1 }); // For leaderboards

export const User = mongoose.model('User', userSchema);
