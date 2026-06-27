import { PROBLEMS } from "../data/defaultProblems.js";
import Problem from "../models/Problem.js";

export async function seedDefaultProblems() {
    const operations = Object.values(PROBLEMS).map((problem) => ({
        updateOne: {
            filter: { slug: problem.id },
            update: {
                $setOnInsert: {
                    slug: problem.id,
                    title: problem.title,
                    difficulty: problem.difficulty.toLowerCase(),
                    category: problem.category,
                    description: problem.description,
                    examples: problem.examples,
                    constraints: problem.constraints,
                    starterCode: problem.starterCode,
                    expectedOutput: problem.expectedOutput,
                    source: "built-in",
                    isPublic: true,
                },
            },
            upsert: true,
        },
    }));

    if (operations.length > 0) {
        await Problem.bulkWrite(operations);
    }
}
