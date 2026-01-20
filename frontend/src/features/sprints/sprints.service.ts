import api from "@/shared/api/client";
import { Sprint, CreateSprintDTO, UpdateSprintDTO } from "./sprints.types";

export const sprintsService = {
    getByProject: async (projectId: string): Promise<Sprint[]> => {
        const response = await api.get<Sprint[]>("/sprints", { params: { projectId } });
        return response.data;
    },

    create: async (data: CreateSprintDTO): Promise<Sprint> => {
        const response = await api.post<Sprint>("/sprints", data);
        return response.data;
    },

    update: async (id: string, data: UpdateSprintDTO): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/sprints/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/sprints/${id}`);
        return response.data;
    },

    activate: async (id: string): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/sprints/${id}/activate`);
        return response.data;
    },

    complete: async (id: string): Promise<{ message: string; actual_velocity: number }> => {
        const response = await api.put<{ message: string; actual_velocity: number }>(`/sprints/${id}/complete`);
        return response.data;
    },
};
