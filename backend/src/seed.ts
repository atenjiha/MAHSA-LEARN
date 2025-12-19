import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Course } from './models/Course';
import { Badge } from './models/Badge';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

// Initial Users Data
const INITIAL_USERS = [
    {
        id: '12345',
        pin: '1234',
        name: 'Sarah Jenkins',
        role: 'Nurse',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=0ea5e9&color=fff',
        xp: 1250,
        streak: 5,
        badges: ['b1', 'b2'],
        completedCourses: [],
        quizAttempts: []
    },
    {
        id: '54321',
        pin: '1234',
        name: 'Mike Ross',
        role: 'Nurse',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=f59e0b&color=fff',
        xp: 850,
        streak: 2,
        badges: ['b1'],
        completedCourses: [],
        quizAttempts: []
    },
    {
        id: '99901',
        pin: '1234',
        name: 'Emily Blunt',
        role: 'Nurse',
        avatar: 'https://ui-avatars.com/api/?name=Emily+Blunt&background=10b981&color=fff',
        xp: 2100,
        streak: 12,
        badges: ['b1', 'b2', 'b3'],
        completedCourses: [],
        quizAttempts: []
    },
    {
        id: 'admin',
        pin: '1234',
        name: 'Dr. A. Wong',
        role: 'Educator',
        avatar: 'https://ui-avatars.com/api/?name=Dr+Wong&background=6366f1&color=fff',
        xp: 0,
        streak: 0,
        badges: [],
        completedCourses: [],
        quizAttempts: []
    }
];

// Initial Badges Data
const INITIAL_BADGES = [
    { id: 'b1', name: 'Fast Starter', icon: '⚡', description: 'Completed first course' },
    { id: 'b2', name: 'Knowledge Seeker', icon: '📚', description: 'Earned 1000+ XP' },
    { id: 'b3', name: 'Streak Master', icon: '🔥', description: '7-day login streak' },
    { id: 'b4', name: 'Quiz Whiz', icon: '🧠', description: 'Perfect score on a quiz' },
];

// Initial Courses Data
const INITIAL_COURSES = [
    {
        id: 'c1',
        title: 'Hand Hygiene Protocol',
        category: 'Infection Control',
        durationMinutes: 5,
        xpReward: 100,
        timestamp: Date.now() - 1000000000,
        slides: [
            {
                id: 's1',
                type: 'intro',
                title: 'Importance of Hygiene',
                content: 'Proper hand hygiene is the single most important way to prevent the spread of infection.',
                image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=800'
            },
            {
                id: 's2',
                type: 'video',
                title: 'The 5 Moments',
                content: 'https://www.youtube.com/embed/IisgnbMfKvI?rel=0&modestbranding=1&enablejsapi=1',
            },
            {
                id: 's3',
                type: 'quiz',
                title: 'Quick Check',
                content: '',
                quizData: {
                    question: 'How long should you rub your hands together with soap?',
                    options: ['5 seconds', '10 seconds', 'At least 20 seconds', '1 minute'],
                    correctIndex: 2
                }
            },
            {
                id: 's4',
                type: 'summary',
                title: 'Module Complete',
                content: 'You have successfully reviewed the Hand Hygiene protocols. Keep up the good work!',
                image: 'https://images.unsplash.com/photo-1628160205073-b26a117b9b00?auto=format&fit=crop&q=80&w=800'
            }
        ]
    },
    {
        id: 'c2',
        title: 'Code Red Protocol',
        category: 'Emergency',
        durationMinutes: 8,
        xpReward: 150,
        timestamp: Date.now(),
        slides: [
            {
                id: 's1',
                type: 'intro',
                title: 'Fire Safety',
                content: 'Remember R.A.C.E: Rescue, Alarm, Contain, Extinguish.',
                image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80&w=800'
            },
            {
                id: 's2',
                type: 'quiz',
                title: 'R.A.C.E Acronym',
                content: '',
                quizData: {
                    question: 'What does the "C" stand for in RACE?',
                    options: ['Call', 'Contain', 'Cancel', 'Care'],
                    correctIndex: 1
                }
            },
            {
                id: 's3',
                type: 'summary',
                title: 'Stay Alert',
                content: 'Knowing the Code Red protocol saves lives. Ensure you know where the nearest exit is.',
            }
        ]
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        await User.deleteMany({});
        await Course.deleteMany({});
        await Badge.deleteMany({});
        console.log('✓ Cleared existing data');

        // Seed Users
        await User.insertMany(INITIAL_USERS);
        console.log(`✓ Seeded ${INITIAL_USERS.length} users`);

        // Seed Badges
        await Badge.insertMany(INITIAL_BADGES);
        console.log(`✓ Seeded ${INITIAL_BADGES.length} badges`);

        // Seed Courses
        await Course.insertMany(INITIAL_COURSES);
        console.log(`✓ Seeded ${INITIAL_COURSES.length} courses`);

        console.log('\n🎉 Database seeding completed successfully!');

        // Close connection
        await mongoose.connection.close();
        console.log('✓ Database connection closed');

    } catch (error) {
        console.error('✗ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();
