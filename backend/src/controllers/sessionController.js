import crypto from "crypto"
import { chatClient, streamClient } from "../lib/stream.js"
import Session from "../models/Session.js"


export async function createSession(req, res) {
    try {
        const { problem, difficulty, problemDetails } = req.body
        const userId = req.user._id
        const clerkId = req.user.clerkId

        if (!problem || !difficulty) {
            return res.status(400).json({ msg: "Problem and difficulty are required" })
        }

        const normalizedDifficulty = difficulty.toLowerCase()
        if (!["easy", "medium", "hard"].includes(normalizedDifficulty)) {
            return res.status(400).json({ msg: "Unsupported difficulty" })
        }

        const sessionProblemDetails = problemDetails
            ? {
                ...problemDetails,
                title: problemDetails.title || problem,
                difficulty: normalizedDifficulty,
            }
            : {
                title: problem,
                difficulty: normalizedDifficulty,
                description: { text: "", notes: [] },
                examples: [],
                constraints: [],
                starterCode: {},
            }

        //generate a unique callId for the video call

        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const inviteToken = crypto.randomBytes(24).toString("hex")

        //create session in db 

        const session = await Session.create({
            problem,
            difficulty: normalizedDifficulty,
            problemDetails: sessionProblemDetails,
            host: userId,
            callId,
            inviteToken,
        })

        //create stream video call

        await streamClient.video.call("default", callId).getOrCreate({
            data: {
                created_by_id: clerkId,
                custom: { problem, difficulty: normalizedDifficulty, sessionId: session._id.toString() },
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

export async function getActiveSessions(req, res) {
    try {
        const userId = req.user._id

        const sessions = await Session.find({
            status: "active",
            $or: [{ host: userId }, { participant: userId }]
        })
            .populate("host", "name profileImage email clerkId")
            .populate("participant", "name profileImage email clerkId")
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
        const sessions = await Session.find({
            status: "completed",
            $or: [{ host: userId }, { participant: userId }]
        })
            .populate("host", "name profileImage email clerkId")
            .populate("participant", "name profileImage email clerkId")
            .sort({ endedAt: -1, updatedAt: -1 })
            .limit(20)
        res.status(200).json({ sessions })

    } catch (error) {
        console.log("Error fetching recent sessions:", error)
        res.status(500).json({ msg: "Failed to fetch recent sessions" })
    }
}

export async function getSessionById(req, res) {
    try {
        const { id } = req.params
        const { inviteToken } = req.query
        const userId = req.user._id

        const session = await Session.findById(id)
            .populate("host", "name email profileImage clerkId")
            .populate("participant", "name email profileImage clerkId")

        if (!session) return res.status(404).json({ msg: "Session not found" })

        const isHost = session.host._id.toString() === userId.toString()
        const isParticipant = session.participant?._id.toString() === userId.toString()
        const hasInvite = session.inviteToken && inviteToken === session.inviteToken

        if (!isHost && !isParticipant && !hasInvite) {
            return res.status(403).json({ msg: "Invite link required to access this session" })
        }

        res.status(200).json({ session })
    } catch (error) {
        console.log("Error fetching session by id:", error)
        res.status(500).json({ msg: "Failed to fetch session" })
    }
}

export async function joinSession(req, res) {
    try {
        const { id } = req.params
        const { inviteToken } = req.body
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)

        if (!session) return res.status(404).json({ msg: "Session not found" })

        if (session.status !== "active") return res.status(400).json({ msg: "Session is not active" })

        if (session.host.toString() === userId.toString()) return res.status(400).json({ msg: "Host cannot join their own session" })

        if (!session.inviteToken || inviteToken !== session.inviteToken) {
            return res.status(403).json({ msg: "Valid invite link required to join this session" })
        }

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
        session.endedAt = new Date()
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

export async function updateSessionWorkspace(req, res) {
    try {
        const { id } = req.params
        const userId = req.user._id
        const { language, code, output } = req.body

        const session = await Session.findById(id)

        if (!session) return res.status(404).json({ msg: "Session not found" })

        const isHost = session.host.toString() === userId.toString()
        const isParticipant = session.participant?.toString() === userId.toString()

        if (!isHost && !isParticipant) {
            return res.status(403).json({ msg: "Only session members can update the workspace" })
        }

        if (session.status !== "active") {
            return res.status(400).json({ msg: "Cannot update a completed session" })
        }

        if (!session.workspace) session.workspace = {}

        if (typeof language === "string") session.workspace.language = language
        if (typeof code === "string") session.workspace.code = code
        if ("output" in req.body) session.workspace.output = output
        session.workspace.updatedAt = new Date()
        session.markModified("workspace")

        await session.save()

        res.status(200).json({ workspace: session.workspace })
    } catch (error) {
        console.log("Error updating session workspace:", error)
        res.status(500).json({ msg: "Failed to update session workspace" })
    }
}
