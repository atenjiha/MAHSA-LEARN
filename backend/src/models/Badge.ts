import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Badge = mongoose.model('Badge', badgeSchema);
