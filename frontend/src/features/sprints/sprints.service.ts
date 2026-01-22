import api from "@/shared/api/client";
import {
    Sprint,
    CreateSprintDTO,
    UpdateSprintDTO,
    ActiveSprintData,
    BurndownChartData,
    VelocityChartData,
    MoveItemToSprintDTO,
    CompleteSprintDTO
} from "./sprints.types";

export const sprintsService = {
    getByProject: async (projectId: string): Promise<Sprint[]> => {
        const response = await api.get<Sprint[]>("/sprints", { params: { projectId } });
        return response.data;
    },

    getActiveSprint: async (projectId: string): Promise<ActiveSprintData> => {
        const response = await api.get<ActiveSprintData>("/sprints/active", { params: { projectId } });
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

    complete: async (id: string, data?: CompleteSprintDTO): Promise<{ message: string; actual_velocity: number; unfinished_handled: string; unfinished_count: number }> => {
        const response = await api.put<{ message: string; actual_velocity: number; unfinished_handled: string; unfinished_count: number }>(`/sprints/${id}/complete`, data);
        return response.data;
    },

    getBurndownChart: async (sprintId: string): Promise<BurndownChartData> => {
        const response = await api.get<BurndownChartData>(`/sprints/${sprintId}/burndown`);
        return response.data;
    },

    getVelocityChart: async (projectId: string): Promise<VelocityChartData> => {
        const response = await api.get<VelocityChartData>("/sprints/velocity-chart", { params: { projectId } });
        return response.data;
    },

    moveItemToSprint: async (sprintId: string, data: MoveItemToSprintDTO): Promise<{ sprint: Sprint; warning?: string }> => {
        const response = await api.post<{ sprint: Sprint; warning?: string }>(`/sprints/${sprintId}/items`, data);
        return response.data;
    },

    removeItemFromSprint: async (sprintId: string, itemId: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/sprints/${sprintId}/items/${itemId}`);
        return response.data;
    },
};
