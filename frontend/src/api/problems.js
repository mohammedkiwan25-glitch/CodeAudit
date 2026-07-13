import axiosInstance from "../lib/axios";

export const problemApi = {
  getProblems: async () => {
    const response = await axiosInstance.get("/problems");
    return response.data;
  },

  getProblemBySlug: async (slug) => {
    const response = await axiosInstance.get(`/problems/${slug}`);
    return response.data;
  },
  getMyProblems: async () => {
    const response = await axiosInstance.get("/problems/mine");
    return response.data;
  },
  createProblem: async (data) => {
    const response = await axiosInstance.post("/problems", data);
    return response.data;
  },
  updateProblem: async ({ id, data }) => {
    const response = await axiosInstance.put(`/problems/${id}`, data);
    return response.data;
  },
  deleteProblem: async (id) => {
    const response = await axiosInstance.delete(`/problems/${id}`);
    return response.data;
  },
};
