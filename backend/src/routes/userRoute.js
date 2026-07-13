import express from "express"
import { getCurrentUser } from "../controllers/userController.js"
import { protectRoute } from "../middleware/protectRoute.js"

const router = express.Router()

router.get("/me", protectRoute, getCurrentUser)

export default router
