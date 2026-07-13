import axiosInstance from "../lib/axios";

export const supervisorApi = {
  getOverview: async () => {
    const response = await axiosInstance.get("/supervisor/overview");
    return response.data;
  },
};
