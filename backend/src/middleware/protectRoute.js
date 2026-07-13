import { requireAuth } from '@clerk/express'
import User from '../models/User.js'
import { ENV } from '../lib/env.js'

export const protectRoute = [
    requireAuth({ signInUrl: '/sign-in' }),
    async (req, res, next) => {
        try {
            const clerkId = req.auth().userId

            if (!clerkId) return res.status(401).json({ msg: "Unauthorized: No user ID found in token" })

            //find user in db by clerk id
            const user = await User.findOne({ clerkId })

            if (!user) return res.status(404).json({ msg: "User not found" })

            if (ENV.SUPERVISOR_EMAILS.includes(user.email.toLowerCase()) && user.role !== "supervisor") {
                user.role = "supervisor"
                await user.save()
            }

            //attach user to req object
            req.user = user
            next()
        } catch (error) {
            console.error("Error in protectRoute middleware:", error)
            res.status(500).json({ msg: "Server error in authentication" })
        }
    }
]

export const requireSupervisor = (req, res, next) => {
    if (req.user?.role !== "supervisor") {
        return res.status(403).json({ msg: "Supervisor access required" })
    }

    next()
}
