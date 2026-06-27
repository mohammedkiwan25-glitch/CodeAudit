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
};
