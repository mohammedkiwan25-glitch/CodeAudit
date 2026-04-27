import express from "express"
import fetch from "node-fetch"

const router = express.Router()

router.post("/execute", async (req, res) => {
    try {
        const { language, code } = req.body
        console.log("1. Received request:", language)

        const LANGUAGE_COMPILERS = {
            javascript: "typescript-deno",
            python: "python-3.14",
            java: "openjdk-25",
        }

        const compiler = LANGUAGE_COMPILERS[language]
        console.log("2. Compiler:", compiler)
        console.log("3. API Key exists:", !!process.env.COMPILER_API_KEY)

        const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": process.env.COMPILER_API_KEY
            },
            body: JSON.stringify({ compiler, code, input: "" })
        })

        console.log("4. Response status:", response.status)
        const data = await response.json()
        console.log("5. Response data:", data)

        res.json(data)

    } catch (error) {
        console.log("ERROR:", error.message)
        res.status(500).json({ error: error.message })
    }
})

export default router