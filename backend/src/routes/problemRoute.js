import express from "express";
import { getProblemBySlug, getProblems } from "../controllers/problemController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getProblems);
router.get("/:slug", protectRoute, getProblemBySlug);

export default router;
