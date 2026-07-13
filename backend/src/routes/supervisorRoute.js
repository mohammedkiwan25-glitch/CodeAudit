import express from "express"
import { getSupervisorOverview } from "../controllers/supervisorController.js"
import { protectRoute, requireSupervisor } from "../middleware/protectRoute.js"

const router = express.Router()

router.get("/overview", protectRoute, requireSupervisor, getSupervisorOverview)

export default router
