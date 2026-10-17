import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    // Tokens issued before this time are rejected (used to force-logout sessions)
    sessionsValidFrom: { type: Date },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
