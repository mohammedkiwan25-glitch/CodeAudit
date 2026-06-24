import express from "express"
import fetch from "node-fetch"
import { protectRoute } from "../middleware/protectRoute.js"

const router = express.Router()

router.post("/execute", protectRoute, async (req, res) => {
    try {
        const { language, code } = req.body

        const LANGUAGE_COMPILERS = {
            javascript: "typescript-deno",
            python: "python-3.14",
            java: "openjdk-25",
        }

        const compiler = LANGUAGE_COMPILERS[language]

        if (!compiler) return res.status(400).json({ error: "Unsupported language" })
        if (typeof code !== "string" || !code.trim()) {
            return res.status(400).json({ error: "Code is required" })
        }
        if (code.length > 20000) {
            return res.status(400).json({ error: "Code is too long" })
        }
        if (!process.env.COMPILER_API_KEY) {
            return res.status(500).json({ error: "Compiler API key is not configured" })
        }

        const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": process.env.COMPILER_API_KEY
            },
            body: JSON.stringify({ compiler, code, input: "" })
        })

        const data = await response.json()

        res.status(response.ok ? 200 : response.status).json(data)

    } catch (error) {
        console.error("Compiler execution failed:", error.message)
        res.status(500).json({ error: error.message })
    }
})

export default router
