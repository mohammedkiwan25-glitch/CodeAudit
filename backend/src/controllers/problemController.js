import Problem from "../models/Problem.js";

const toClientProblem = (problem) => ({
    _id: problem._id,
    id: problem.slug,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty.slice(0, 1).toUpperCase() + problem.difficulty.slice(1),
    category: problem.category,
    description: problem.description,
    examples: problem.examples,
    constraints: problem.constraints,
    starterCode: problem.starterCode,
    expectedOutput: problem.expectedOutput,
    source: problem.source,
    isPublic: problem.isPublic,
});

export async function getProblems(req, res) {
    try {
        const problems = await Problem.find({ isPublic: true }).sort({ createdAt: 1 });
        res.status(200).json({ problems: problems.map(toClientProblem) });
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ msg: "Failed to fetch problems" });
    }
}

export async function getProblemBySlug(req, res) {
    try {
        const problem = await Problem.findOne({
            slug: req.params.slug.toLowerCase(),
            isPublic: true,
        });

        if (!problem) {
            return res.status(404).json({ msg: "Problem not found" });
        }

        res.status(200).json({ problem: toClientProblem(problem) });
    } catch (error) {
        console.error("Error fetching problem:", error);
        res.status(500).json({ msg: "Failed to fetch problem" });
    }
}
