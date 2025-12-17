import mongoose from 'mongoose';

// Quiz data subdocument for quiz slides
const quizDataSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true }
}, { _id: false });

// Slide subdocument schema
const slideSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['intro', 'video', 'quiz', 'summary'],
    required: true
  },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  image: { type: String }, // Optional, for intro/summary slides
  quizData: { type: quizDataSchema } // Optional, only for quiz slides
}, { _id: false });

const courseSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: { type: String, required: true },
  category: {
    type: String,
    required: true,
    index: true // For filtering by category
  },
  durationMinutes: { type: Number, default: 0 },
  xpReward: { type: Number, default: 0, min: 0 },
  timestamp: { type: Number, default: () => Date.now() },
  slides: { type: [slideSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for common queries
courseSchema.index({ category: 1, createdAt: -1 });
courseSchema.index({ timestamp: -1 }); // For sorting by newest

export const Course = mongoose.model('Course', courseSchema);
