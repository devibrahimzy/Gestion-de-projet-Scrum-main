import api from "@/shared/api/client";
import { BacklogItem } from "../backlog/backlog.types";

export interface KanbanMoveDTO {
    toStatus: string;
    toPosition: number;
    toSprintId?: string;
}

export const kanbanService = {
    getBoard: async (sprintId: string, filters?: { assigned_to_id?: string; type?: string }): Promise<BacklogItem[]> => {
        const response = await api.get<BacklogItem[]>(`/kanban/${sprintId}`, { params: filters });
        return response.data;
    },

    moveItem: async (id: string, data: KanbanMoveDTO): Promise<{ message: string; item: BacklogItem }> => {
        const response = await api.patch<{ message: string; item: BacklogItem }>(`/kanban/move/${id}`, data);
        return response.data;
    },
};
