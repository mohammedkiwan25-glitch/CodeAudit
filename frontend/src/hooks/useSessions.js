import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
    const result = useMutation({
        mutationKey: ["createSession"],
        mutationFn: sessionApi.createSession,
        onSuccess: () => toast.success("Session created successfully!"),
        onError: (error) => toast.error(error.response?.data?.message || "Failed to create room"),
    });

    return result;
};

export const useActiveSessions = () => {
    const result = useQuery({
        queryKey: ["activeSessions"],
        queryFn: sessionApi.getActiveSessions,
    });

    return result;
};

export const useMyRecentSessions = () => {
    const result = useQuery({
        queryKey: ["myRecentSessions"],
        queryFn: sessionApi.getMyRecentSessions,
    });

    return result;
};

export const useSessionHistory = () =>
    useQuery({
        queryKey: ["sessionHistory"],
        queryFn: sessionApi.getSessionHistory,
    });

export const useSessionAnalytics = () =>
    useQuery({
        queryKey: ["sessionAnalytics"],
        queryFn: sessionApi.getSessionAnalytics,
    });

export const useSessionById = (id, inviteToken) => {
    const result = useQuery({
        queryKey: ["session", id, inviteToken],
        queryFn: () => sessionApi.getSessionById(id, inviteToken),
        enabled: !!id,
        retry: false,
        refetchInterval: (query) => (query.state.error ? false : 1000), // keep syncing only while the session loads successfully
    });

    return result;
};

export const useJoinSession = () => {
    const result = useMutation({
        mutationKey: ["joinSession"],
        mutationFn: sessionApi.joinSession,
        onSuccess: () => toast.success("Joined session successfully!"),
        onError: (error) => toast.error(error.response?.data?.message || "Failed to join session"),
    });

    return result;
};

export const useEndSession = () => {
    const result = useMutation({
        mutationKey: ["endSession"],
        mutationFn: sessionApi.endSession,
        onSuccess: () => toast.success("Session ended successfully!"),
        onError: (error) => toast.error(error.response?.data?.message || "Failed to end session"),
    });

    return result;
};

export const useUpdateSessionReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sessionApi.updateSessionReport,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["session", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["sessionAnalytics"] });
            toast.success("Interview report saved");
        },
        onError: (error) => toast.error(error.response?.data?.msg || "Failed to save report"),
    });
};
