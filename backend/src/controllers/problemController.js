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
    createdBy: problem.createdBy,
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
});

const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const normalizeProblemInput = (body) => ({
    title: body.title?.trim(),
    difficulty: body.difficulty?.toLowerCase(),
    category: body.category?.trim() || "Custom Interview Problem",
    description: {
        text: body.description?.text?.trim() || "",
        notes: Array.isArray(body.description?.notes) ? body.description.notes.filter(Boolean) : [],
    },
    examples: Array.isArray(body.examples) ? body.examples.slice(0, 10) : [],
    constraints: Array.isArray(body.constraints) ? body.constraints.filter(Boolean).slice(0, 30) : [],
    starterCode: body.starterCode || {},
    expectedOutput: body.expectedOutput || {},
    isPublic: Boolean(body.isPublic),
})

export async function getProblems(req, res) {
    try {
        const problems = await Problem.find({
            $or: [{ isPublic: true }, { createdBy: req.user._id }],
        }).sort({ source: 1, createdAt: 1 });
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
            $or: [{ isPublic: true }, { createdBy: req.user._id }],
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

export async function getMyProblems(req, res) {
    try {
        const problems = await Problem.find({
            source: "custom",
            createdBy: req.user._id,
        }).sort({ updatedAt: -1 })

        res.status(200).json({ problems: problems.map(toClientProblem) })
    } catch (error) {
        console.error("Error fetching user problems:", error)
        res.status(500).json({ msg: "Failed to fetch your problems" })
    }
}

export async function createProblem(req, res) {
    try {
        const input = normalizeProblemInput(req.body)

        if (!input.title || !input.description.text) {
            return res.status(400).json({ msg: "Title and description are required" })
        }
        if (!["easy", "medium", "hard"].includes(input.difficulty)) {
            return res.status(400).json({ msg: "Invalid difficulty" })
        }

        const baseSlug = slugify(input.title) || `problem-${Date.now()}`
        let slug = baseSlug
        let suffix = 2
        while (await Problem.exists({ slug })) {
            slug = `${baseSlug}-${suffix++}`
        }

        const problem = await Problem.create({
            ...input,
            slug,
            source: "custom",
            createdBy: req.user._id,
        })

        res.status(201).json({ problem: toClientProblem(problem) })
    } catch (error) {
        console.error("Error creating problem:", error)
        res.status(500).json({ msg: "Failed to create problem" })
    }
}

export async function updateProblem(req, res) {
    try {
        const problem = await Problem.findOne({
            _id: req.params.id,
            source: "custom",
            createdBy: req.user._id,
        })

        if (!problem) return res.status(404).json({ msg: "Custom problem not found" })

        const input = normalizeProblemInput(req.body)
        if (!input.title || !input.description.text) {
            return res.status(400).json({ msg: "Title and description are required" })
        }
        if (!["easy", "medium", "hard"].includes(input.difficulty)) {
            return res.status(400).json({ msg: "Invalid difficulty" })
        }

        Object.assign(problem, input)
        await problem.save()

        res.status(200).json({ problem: toClientProblem(problem) })
    } catch (error) {
        console.error("Error updating problem:", error)
        res.status(500).json({ msg: "Failed to update problem" })
    }
}

export async function deleteProblem(req, res) {
    try {
        const problem = await Problem.findOneAndDelete({
            _id: req.params.id,
            source: "custom",
            createdBy: req.user._id,
        })

        if (!problem) return res.status(404).json({ msg: "Custom problem not found" })
        res.status(200).json({ msg: "Problem deleted" })
    } catch (error) {
        console.error("Error deleting problem:", error)
        res.status(500).json({ msg: "Failed to delete problem" })
    }
}
