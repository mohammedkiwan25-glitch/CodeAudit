import { use } from "react"
import { chatClient, streamClient } from "../lib/stream.js"
import Session from "../models/Session.js"


export async function createSession(req, res) {
    try {
        const { problem, difficulty } = req.body
        const userId = req.user._id
        const clerkId = req.user.clerkId

        if (!problem || !difficulty) {
            return res.status(400).json({ msg: "Problem and difficulty are required" })
        }

        //generate a unique callId for the video call

        const callId = `session_${Date.now()}_${Math.rrandom().toString(36).substring(7)}`

        //create session in db 

        const session = await Session.create({ problem, difficulty, host: userId, callId })

        //create stream video call

        await streamClient.video.call("deafault", callId).getOrCreate({
            data: {
                created_by_id: clerkId,
                custom: { problem, difficulty, sessionId: session._id.toString() },
            },
        })

        //chat messaging

        const channel = chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId]
        })

        await channel.create()
        res.status(201).json({ session: session })
    } catch (error) {
        console.log("Error creating session:", error)
        res.status(500).json({ msg: "Failed to create session" })
    }
}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({ status: "active" })
            .populate("host", "name profileImage email clerkId")
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ sessions })
    } catch (error) {
        console.log("Error fetching active sessions:", error)
        res.status(500).json({ msg: "Failed to fetch active sessions" })
    }
}

export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id

        // get sessions where the user is either host or participant
        await Session.find({
            status: "completed",
            $or: [{ host: userId }, { participants: userId }]
        }).sort({ createdAt: -1 }).limit(20)
        res.status(200).json({ sessions })

    } catch (error) {
        console.log("Error fetching recent sessions:", error)
        res.status(500).json({ msg: "Failed to fetch recent sessions" })
    }
}

export async function getSessionById(req, res) {
    try {
        const { id } = req.params.id

        const session = await Session.findById(id)
            .populate("host", "name email profileImage clerkId")
            .populate("participants", "name email profileImage clerkId")

        if (!session) return res.status(404).json({ msg: "Session not found" })

        res.status(200).json({ session })
    } catch (error) {
        console.log("Error fetching session by id:", error)
        res.status(500).json({ msg: "Failed to fetch session" })
    }
}

export async function joinSession(req, res) {
    try {
        const { id } = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)

        if (!session) return res.status(404).json({ msg: "Session not found" })

        if (session.status !== "active") return res.status(400).json({ msg: "Session is not active" })

        if (session.host.toString() === userId.toString()) return res.status(400).json({ msg: "Host cannot join their own session" })

        //check if session is full and has participant
        if (session.participant) return res.status(409).json({ msg: "Session is already full" })

        session.participant = userId
        await session.save()

        const channel = chatClient.channel("messaging", session.callId)
        await channel.addMembers([clerkId])

        res.status(200).json({ msg: "Joined session successfully" })

    } catch (error) {
        console.log("Error joining session:", error)
        res.status(500).json({ msg: "Failed to join session" })
    }
}

export async function endSession(req, res) {
    try {
        const { id } = req.params
        const userId = req.user._id

        const session = await Session.findById(id)

        if (!session) return res.status(404).json({ msg: "Session not found" })

        //check if the user is the host of the session
        if (session.host.toString() !== userId.toString()) return res.status(403).json({ msg: "Only the host can end the session" })

        //check if session is already completed
        if (session.status === "completed") return res.status(400).json({ msg: "Session is already completed" })

        session.status = "completed"
        await session.save()

        //delete the stream video call
        const call = streamClient.video.call("default", session.callId)
        await call.delete({ hard: true })

        //delete the chat channel
        const channel = chatClient.channel("messaging", session.callId)
        await channel.delete()

        res.status(200).json({ msg: "Session ended successfully" })
    } catch (error) {
        console.log("Error ending session:", error)
        res.status(500).json({ msg: "Failed to end session" })
    }
}