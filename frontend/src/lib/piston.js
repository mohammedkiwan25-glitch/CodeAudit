const COMPILER_API = "https://api.onlinecompiler.io/api/run-code/"
const API_KEY = import.meta.env.VITE_COMPILER_API_KEY

const LANGUAGE_COMPILERS = {
    javascript: "nodejs-22",
    python: "python-3.14",
    java: "java-openjdk-25",
}

export async function executeCode(language, code) {
    try {
        const response = await fetch("/api/compiler/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language, code })
        })

        const data = await response.json()

        if (data.error) return { success: false, error: data.error }
        return { success: true, output: data.output || "No output" }

    } catch (error) {
        return { success: false, error: `Error executing code: ${error.message}` }
    }
}