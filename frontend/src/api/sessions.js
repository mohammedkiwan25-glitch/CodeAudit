import axiosInstance from '../lib/axios';

export const sessionApi = {
    createSession: async (data) => {
        const response = await axiosInstance.post("/sessions", data)
        return response.data
    },

    getActiveSessions: async () => {
        const response = await axiosInstance.get("/sessions/active",)
        return response.data
    },

    getRecentSessions: async () => {
        const response = await axiosInstance.get("/sessions/my-recent",)
        return response.data
    },

    getSessionsById: async (id) => {
        const response = await axiosInstance.get(`/sessions/${id}`,)
        return response.data
    },

    joinSessions: async (id) => {
        const response = await axiosInstance.post(`/sessions/${id}/join`,)
        return response.data
    },

    endSessions: async (id) => {
        const response = await axiosInstance.post(`/sessions/${id}/end`,)
        return response.data
    },

    getStreamToken: async () => {
        const response = await axiosInstance.get(`/chat/token`,)
        return response.data
    },
}