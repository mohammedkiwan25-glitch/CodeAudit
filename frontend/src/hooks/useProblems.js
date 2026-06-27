import { useQuery } from "@tanstack/react-query";
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
