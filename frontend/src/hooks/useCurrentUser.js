import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/users";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: userApi.getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });
