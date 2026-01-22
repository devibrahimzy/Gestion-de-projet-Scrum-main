import api from "@/shared/api/client";
import { DashboardSummary, VelocityData, AgilePerformance, BurndownData, HealthIndicators, MemberWorkload, VelocityComparison, CurrentSprint, AnalyticsResponse, SprintData } from "./dashboard.types";

export const dashboardService = {
    getSummary: async (projectId: string): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>(`/dashboard/${projectId}/summary`);
        return response.data.summary;
    },

    getCurrentSprint: async (projectId: string): Promise<CurrentSprint | null> => {
        const response = await api.get<{ currentSprint: CurrentSprint | null }>(`/dashboard/${projectId}/summary`);
        return response.data.currentSprint;
    },

    getVelocity: async (projectId: string): Promise<VelocityData[]> => {
        const response = await api.get<VelocityData[]>(`/dashboard/${projectId}/velocity`);
        return response.data;
    },

    getVelocityComparison: async (projectId: string): Promise<VelocityComparison> => {
        const response = await api.get<{ velocityComparison: VelocityComparison }>(`/dashboard/${projectId}/summary`);
        return response.data.velocityComparison;
    },

    getAgilePerformance: async (projectId: string): Promise<AgilePerformance> => {
        const response = await api.get<AgilePerformance>(`/dashboard/${projectId}/agile`);
        return response.data;
    },

    getBurndownData: async (projectId: string): Promise<BurndownData[]> => {
        const response = await api.get<BurndownData[]>(`/dashboard/${projectId}/burndown`);
        return response.data;
    },

    getWorkload: async (projectId: string): Promise<MemberWorkload[]> => {
        const response = await api.get<{ workload: MemberWorkload[] }>(`/dashboard/${projectId}/summary`);
        return response.data.workload;
    },

    getHealthIndicators: async (projectId: string): Promise<HealthIndicators> => {
        const response = await api.get<HealthIndicators>(`/dashboard/${projectId}/health`);
        return response.data;
    },

    getAllAnalytics: async (projectId: string): Promise<AnalyticsResponse> => {
        const response = await api.get<AnalyticsResponse>(`/dashboard/${projectId}/analytics`);
        return response.data;
    },
};
