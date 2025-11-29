import { apiCall } from "@/lib/api";

export const adminDashboardApi = {
    getDashboard: async () => {
        const res = await apiCall("/admin/dashboard/dashboard")

        return res;
        return res.data;
    }
};
