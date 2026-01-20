import api from "@/shared/api/client";
import { Retrospective, RetroItem, CreateRetroDTO, CreateRetroItemDTO } from "./retrospectives.types";

export const retrospectivesService = {
    getBySprint: async (sprintId: string): Promise<Retrospective> => {
        const response = await api.get<Retrospective>(`/retrospectives/sprint/${sprintId}`);
        return response.data;
    },

    create: async (data: CreateRetroDTO): Promise<Retrospective> => {
        const response = await api.post<Retrospective>("/retrospectives", data);
        return response.data;
    },

    publish: async (id: string): Promise<{ message: string }> => {
        const response = await api.patch<{ message: string }>(`/retrospectives/${id}/publish`);
        return response.data;
    },

    addItem: async (data: CreateRetroItemDTO): Promise<RetroItem> => {
        const response = await api.post<RetroItem>("/retrospectives/items", data);
        return response.data;
    },

    voteItem: async (id: string): Promise<{ message: string; votes: number }> => {
        const response = await api.post<{ message: string; votes: number }>(`/retrospectives/items/${id}/vote`);
        return response.data;
    },

    updateItemStatus: async (id: string, is_completed: boolean): Promise<{ message: string }> => {
        const response = await api.patch<{ message: string }>(`/retrospectives/items/${id}/status`, { is_completed });
        return response.data;
    },

    deleteItem: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/retrospectives/items/${id}`);
        return response.data;
    },

    getByProject: async (projectId: string): Promise<Retrospective[]> => {
        const response = await api.get<Retrospective[]>(`/retrospectives/project/${projectId}`);
        return response.data;
    },

    getTrends: async (projectId: string): Promise<any> => {
        const response = await api.get<any>(`/retrospectives/project/${projectId}/trends`);
        return response.data;
    },
};
