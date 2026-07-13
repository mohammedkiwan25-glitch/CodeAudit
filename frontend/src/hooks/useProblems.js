import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { problemApi } from "../api/problems";

export const useProblems = () =>
  useQuery({
    queryKey: ["problems"],
    queryFn: problemApi.getProblems,
  });

export const useProblem = (slug) =>
  useQuery({
    queryKey: ["problem", slug],
    queryFn: () => problemApi.getProblemBySlug(slug),
    enabled: Boolean(slug),
  });

export const useMyProblems = () =>
  useQuery({
    queryKey: ["myProblems"],
    queryFn: problemApi.getMyProblems,
  });

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: problemApi.createProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["myProblems"] });
      toast.success("Problem created");
    },
    onError: (error) => toast.error(error.response?.data?.msg || "Failed to create problem"),
  });
};

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: problemApi.updateProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["myProblems"] });
      toast.success("Problem updated");
    },
    onError: (error) => toast.error(error.response?.data?.msg || "Failed to update problem"),
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: problemApi.deleteProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["myProblems"] });
      toast.success("Problem deleted");
    },
    onError: (error) => toast.error(error.response?.data?.msg || "Failed to delete problem"),
  });
};
