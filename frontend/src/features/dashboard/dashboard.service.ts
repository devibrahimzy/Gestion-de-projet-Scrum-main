import api from "@/shared/api/client";
import { DashboardSummary, VelocityData, AgilePerformance } from "./dashboard.types";

export const dashboardService = {
    getSummary: async (projectId: string): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>(`/dashboard/${projectId}/summary`);
        return response.data;
    },

    getVelocity: async (projectId: string): Promise<VelocityData[]> => {
        const response = await api.get<VelocityData[]>(`/dashboard/${projectId}/velocity`);
        return response.data;
    },

    getAgilePerformance: async (projectId: string): Promise<AgilePerformance> => {
        const response = await api.get<AgilePerformance>(`/dashboard/${projectId}/agile`);
        return response.data;
    },
};
