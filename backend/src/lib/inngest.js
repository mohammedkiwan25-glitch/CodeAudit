import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";
import { ENV } from "./env.js";


export const inngest = new Inngest({ id: "code-audit" })

const syncUser = inngest.createFunction(
    { id: "sync-user" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        await connectDB()

        const {id,email_addresses,first_name,last_name,image_url } = event.data

        const newUser = {
            clerkId: id,
            email:email_addresses[0]?.email_address,
            name: `${first_name || ""} ${last_name || ""}`,
            profileImage:image_url,
            role: ENV.SUPERVISOR_EMAILS.includes(email_addresses[0]?.email_address?.toLowerCase())
                ? "supervisor"
                : "user",
        }

        await User.create(newUser)

        await upsertStreamUser({
            id: newUser.clerkId.toString(),
            name: newUser.name,
            image: newUser.profileImage
        })
    }
)

const deleteUserFromDB = inngest.createFunction(
    { id: "delete-user-from-db" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        await connectDB()

        const {id} = event.data
        await User.deleteOne({clerkId:id})

        await deleteStreamUser(id.toString())
    }
)
export const functions = [syncUser, deleteUserFromDB]
