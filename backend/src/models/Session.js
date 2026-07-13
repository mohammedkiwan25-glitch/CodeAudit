import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    problem: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    problemDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        default: null,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    },
    //stream video call id
    callId: {
        type: String,
        default: "",
    },
    inviteToken: {
        type: String,
        unique: true,
        sparse: true,
    },
    workspace: {
        language: {
            type: String,
            default: "javascript",
        },
        code: {
            type: String,
            default: "",
        },
        output: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    endedAt: {
        type: Date,
    },
    report: {
        outcome: {
            type: String,
            enum: ['pending', 'strong-hire', 'hire', 'no-hire'],
            default: 'pending',
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        rubric: {
            problemSolving: { type: Number, min: 1, max: 5, default: null },
            correctness: { type: Number, min: 1, max: 5, default: null },
            codeQuality: { type: Number, min: 1, max: 5, default: null },
            communication: { type: Number, min: 1, max: 5, default: null },
            complexity: { type: Number, min: 1, max: 5, default: null },
        },
        notes: {
            type: String,
            default: "",
        },
        strengths: {
            type: String,
            default: "",
        },
        improvements: {
            type: String,
            default: "",
        },
        updatedAt: {
            type: Date,
        },
    },
}, {timestamps: true}
)

const Session = mongoose.model('Session', SessionSchema);

export default Session;
