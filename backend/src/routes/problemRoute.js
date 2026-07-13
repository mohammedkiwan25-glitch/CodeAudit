import express from "express";
import { createProblem, deleteProblem, getMyProblems, getProblemBySlug, getProblems, updateProblem } from "../controllers/problemController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getProblems);
router.get("/mine", protectRoute, getMyProblems);
router.post("/", protectRoute, createProblem);
router.put("/:id", protectRoute, updateProblem);
router.delete("/:id", protectRoute, deleteProblem);
router.get("/:slug", protectRoute, getProblemBySlug);

export default router;
