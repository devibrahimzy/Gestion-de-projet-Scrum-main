import api from "../../shared/api/client";
import type { BacklogItem, CreateBacklogItemDTO, UpdateBacklogItemDTO } from "./backlog.types";

export const backlogService = {
    getByProject: async (projectId: string): Promise<BacklogItem[]> => {
        const response = await api.get<BacklogItem[]>("/backlog", { params: { projectId } });
        return response.data;
    },

    getById: async (id: string): Promise<BacklogItem> => {
        const response = await api.get<BacklogItem>(`/backlog/${id}`);
        return response.data;
    },

    getBySprint: async (sprintId: string): Promise<BacklogItem[]> => {
        const response = await api.get<BacklogItem[]>(`/backlog/sprint/${sprintId}`);
        return response.data;
    },

    create: async (data: CreateBacklogItemDTO): Promise<BacklogItem> => {
        const response = await api.post<BacklogItem>("/backlog", data);
        return response.data;
    },

    update: async (id: string, data: UpdateBacklogItemDTO): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/backlog/${id}`, data);
        return response.data;
    },

    assignMember: async (id: string, userId: string | null): Promise<{ message: string; assigned_to_id: string | null }> => {
        const response = await api.patch<{ message: string; assigned_to_id: string | null }>(`/backlog/${id}/assign`, { userId });
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/backlog/${id}`);
        return response.data;
    },
};
