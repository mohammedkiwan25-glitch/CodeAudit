import Session from "../models/Session.js"
import User from "../models/User.js"

const average = (values) => values.length
    ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
    : 0

export async function getSupervisorOverview(req, res) {
    try {
        const [users, sessions] = await Promise.all([
            User.find().select("name email profileImage role createdAt").sort({ createdAt: -1 }).lean(),
            Session.find()
                .select("problem difficulty host participant status createdAt endedAt report.rating report.outcome")
                .populate("host", "name email profileImage")
                .populate("participant", "name email profileImage")
                .sort({ createdAt: -1 })
                .lean(),
        ])

        const completed = sessions.filter((session) => session.status === "completed")
        const ratings = completed.map((session) => session.report?.rating).filter(Boolean)
        const outcomes = completed.reduce((counts, session) => {
            const outcome = session.report?.outcome || "pending"
            counts[outcome] = (counts[outcome] || 0) + 1
            return counts
        }, { pending: 0, "strong-hire": 0, hire: 0, "no-hire": 0 })

        const interviewerMap = new Map()
        for (const session of sessions) {
            if (!session.host) continue
            const id = session.host._id.toString()
            const current = interviewerMap.get(id) || {
                _id: id,
                name: session.host.name,
                email: session.host.email,
                total: 0,
                completed: 0,
                ratings: [],
            }
            current.total += 1
            if (session.status === "completed") current.completed += 1
            if (session.report?.rating) current.ratings.push(session.report.rating)
            interviewerMap.set(id, current)
        }

        const interviewers = Array.from(interviewerMap.values())
            .map(({ ratings: interviewerRatings, ...interviewer }) => ({
                ...interviewer,
                averageRating: average(interviewerRatings),
            }))
            .sort((a, b) => b.total - a.total)

        res.status(200).json({
            overview: {
                stats: {
                    users: users.length,
                    interviews: sessions.length,
                    active: sessions.length - completed.length,
                    completed: completed.length,
                    reportsCompleted: completed.filter((session) => session.report?.rating).length,
                    averageRating: average(ratings),
                },
                outcomes,
                interviewers,
                recentSessions: sessions.slice(0, 15),
                recentUsers: users.slice(0, 10),
            },
        })
    } catch (error) {
        console.error("Error fetching supervisor overview:", error)
        res.status(500).json({ msg: "Failed to fetch supervisor dashboard" })
    }
}
