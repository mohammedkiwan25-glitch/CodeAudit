import express from "express"
import path from "path"

import { ENV } from './lib/env.js'
import { connectDB } from "./lib/db.js"

const app = express()

const __dirname = path.resolve()

app.get("/health", (req, res) => {
    res.status(200).json({ msg: "success from backend" })
})

app.get("/books", (req, res) => {
    res.status(200).json({ msg: "success from cacaca" })
})

//make our app ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
    })
}



const startServer = async () => {
    try {
        await connectDB()
        app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT))
    } catch (error) {
        console.error("Failed to start the server:", error)
        process.exit(1) // Exit the process with an error code
    }
}
startServer()