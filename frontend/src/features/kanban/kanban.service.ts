import api from "@/shared/api/client";
import {
    KanbanBoard,
    KanbanColumn,
    KanbanMoveDTO,
    CreateKanbanColumnDTO,
    UpdateKanbanColumnDTO,
    KanbanFilters
} from "./kanban.types";

export const kanbanService = {
    getBoard: async (sprintId: string, filters?: KanbanFilters): Promise<KanbanBoard> => {
        const response = await api.get<KanbanBoard>(`/kanban/${sprintId}`, { params: filters });
        return response.data;
    },

    moveItem: async (id: string, data: KanbanMoveDTO): Promise<{ message: string; item: any }> => {
        const response = await api.patch<{ message: string; item: any }>(`/kanban/move/${id}`, data);
        return response.data;
    },

    // Column management
    getColumns: async (projectId: string): Promise<KanbanColumn[]> => {
        const response = await api.get<KanbanColumn[]>(`/kanban/columns/${projectId}`);
        return response.data;
    },

    createColumn: async (projectId: string, data: CreateKanbanColumnDTO): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/kanban/columns/${projectId}`, data);
        return response.data;
    },

    updateColumn: async (columnId: string, data: UpdateKanbanColumnDTO): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/kanban/columns/${columnId}`, data);
        return response.data;
    },

    deleteColumn: async (columnId: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/kanban/columns/${columnId}`);
        return response.data;
    },
};
