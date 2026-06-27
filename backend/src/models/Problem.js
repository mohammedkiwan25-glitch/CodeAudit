import mongoose from "mongoose";

const ExampleSchema = new mongoose.Schema(
    {
        input: { type: String, default: "" },
        output: { type: String, default: "" },
        explanation: { type: String, default: "" },
    },
    { _id: false }
);

const ProblemSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true,
        },
        category: {
            type: String,
            default: "",
            trim: true,
        },
        description: {
            text: { type: String, required: true },
            notes: { type: [String], default: [] },
        },
        examples: {
            type: [ExampleSchema],
            default: [],
        },
        constraints: {
            type: [String],
            default: [],
        },
        starterCode: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        expectedOutput: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        source: {
            type: String,
            enum: ["built-in", "custom"],
            default: "built-in",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Problem = mongoose.model("Problem", ProblemSchema);

export default Problem;
