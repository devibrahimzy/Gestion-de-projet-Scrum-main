import api from "@/shared/api/client";
import {
    Retrospective,
    RetroItem,
    CreateRetroDTO,
    CreateRetroItemDTO,
    UpdateRetroItemDTO,
    UserVotingStatus,
    RetroSettings,
    RetroExportData,
    RetroTrendsData
} from "./retrospectives.types";

export const retrospectivesService = {
    // Retrospective CRUD
    getBySprint: async (sprintId: string): Promise<Retrospective | null> => {
        const response = await api.get<Retrospective | null>(`/retrospectives/sprint/${sprintId}`);
        return response.data;
    },

    create: async (data: CreateRetroDTO): Promise<Retrospective> => {
        const response = await api.post<Retrospective>("/retrospectives", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Retrospective>): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/retrospectives/${id}`, data);
        return response.data;
    },

    publish: async (id: string): Promise<{ message: string }> => {
        const response = await api.patch<{ message: string }>(`/retrospectives/${id}/publish`);
        return response.data;
    },

    // Item management
    addItem: async (data: CreateRetroItemDTO): Promise<RetroItem> => {
        const response = await api.post<RetroItem>("/retrospectives/items", data);
        return response.data;
    },

    updateItem: async (id: string, data: UpdateRetroItemDTO): Promise<RetroItem> => {
        const response = await api.put<RetroItem>(`/retrospectives/items/${id}`, data);
        return response.data;
    },

    deleteItem: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/retrospectives/items/${id}`);
        return response.data;
    },

    // Voting
    voteItem: async (id: string): Promise<{ message: string; votes: number; can_vote: boolean }> => {
        const response = await api.post<{ message: string; votes: number; can_vote: boolean }>(`/retrospectives/items/${id}/vote`);
        return response.data;
    },

    unvoteItem: async (id: string): Promise<{ message: string; votes: number }> => {
        const response = await api.delete<{ message: string; votes: number }>(`/retrospectives/items/${id}/vote`);
        return response.data;
    },

    getUserVotingStatus: async (retrospectiveId: string): Promise<UserVotingStatus> => {
        const response = await api.get<UserVotingStatus>(`/retrospectives/${retrospectiveId}/voting-status`);
        return response.data;
    },

    // Action items
    updateItemStatus: async (id: string, is_completed: boolean): Promise<{ message: string }> => {
        const response = await api.patch<{ message: string }>(`/retrospectives/items/${id}/status`, { is_completed });
        return response.data;
    },

    assignActionItem: async (id: string, assigned_to_id: string, due_date?: string): Promise<RetroItem> => {
        const response = await api.patch<RetroItem>(`/retrospectives/items/${id}/assign`, { assigned_to_id, due_date });
        return response.data;
    },

    // Settings
    updateSettings: async (id: string, settings: RetroSettings): Promise<{ message: string }> => {
        const response = await api.patch<{ message: string }>(`/retrospectives/${id}/settings`, settings);
        return response.data;
    },

    // History and analytics
    getByProject: async (projectId: string): Promise<Retrospective[]> => {
        const response = await api.get<Retrospective[]>(`/retrospectives/project/${projectId}`);
        return response.data;
    },

    getTrends: async (projectId: string): Promise<RetroTrendsData[]> => {
        const response = await api.get<RetroTrendsData[]>(`/retrospectives/project/${projectId}/trends`);
        return response.data;
    },

    // Export
    exportPDF: async (id: string): Promise<Blob> => {
        const response = await api.get(`/retrospectives/${id}/export/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    exportData: async (id: string): Promise<RetroExportData> => {
        const response = await api.get<RetroExportData>(`/retrospectives/${id}/export/data`);
        return response.data;
    },
};
