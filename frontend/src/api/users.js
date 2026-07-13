import axiosInstance from "../lib/axios";

export const userApi = {
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },
};
