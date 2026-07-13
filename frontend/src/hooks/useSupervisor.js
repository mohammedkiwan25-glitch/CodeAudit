import { useQuery } from "@tanstack/react-query";
import { supervisorApi } from "../api/supervisor";

export const useSupervisorOverview = (enabled = true) =>
  useQuery({
    queryKey: ["supervisorOverview"],
    queryFn: supervisorApi.getOverview,
    enabled,
    retry: false,
  });
