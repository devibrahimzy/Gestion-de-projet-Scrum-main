import api from "../../shared/api/client";
import type {
    BacklogItem,
    CreateBacklogItemDTO,
    UpdateBacklogItemDTO,
    AcceptanceCriteria,
    BacklogAttachment,
    BacklogHistory,
    BacklogFilters,
    BacklogSort,
    PlanningPokerSession
} from "./backlog.types";

export const backlogService = {
    getByProject: async (projectId: string, filters?: BacklogFilters, sort?: BacklogSort): Promise<BacklogItem[]> => {
        const params: Record<string, string> = { projectId };
        if (filters) {
            if (filters.type?.length) params.type = filters.type.join(',');
            if (filters.priority?.length) params.priority = filters.priority.join(',');
            if (filters.tags?.length) params.tags = filters.tags.join(',');
        if (filters.assigned_to_id !== undefined) params.assigned_to_id = filters.assigned_to_id === null ? 'null' : filters.assigned_to_id;
        if (filters.sprint_id !== undefined) params.sprint_id = filters.sprint_id === null ? 'null' : filters.sprint_id;
            if (filters.status?.length) params.status = filters.status.join(',');
            if (filters.search) params.search = filters.search;
        }
        if (sort) {
            params.sortBy = sort.field;
            params.sortOrder = sort.direction;
        }

        const response = await api.get<BacklogItem[]>("/backlog", { params });
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

    reorder: async (projectId: string, itemIds: string[]): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/backlog/reorder`, { projectId, itemIds });
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

    // Acceptance Criteria
    getAcceptanceCriteria: async (backlogItemId: string): Promise<AcceptanceCriteria[]> => {
        const response = await api.get<AcceptanceCriteria[]>(`/backlog/${backlogItemId}/acceptance-criteria`);
        return response.data;
    },

    addAcceptanceCriteria: async (backlogItemId: string, description: string): Promise<AcceptanceCriteria> => {
        const response = await api.post<AcceptanceCriteria>(`/backlog/${backlogItemId}/acceptance-criteria`, { description });
        return response.data;
    },

    updateAcceptanceCriteria: async (criteriaId: string, description?: string, is_completed?: boolean): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/backlog/acceptance-criteria/${criteriaId}`, { description, is_completed });
        return response.data;
    },

    deleteAcceptanceCriteria: async (criteriaId: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/backlog/acceptance-criteria/${criteriaId}`);
        return response.data;
    },

    // Attachments
    getAttachments: async (backlogItemId: string): Promise<BacklogAttachment[]> => {
        const response = await api.get<BacklogAttachment[]>(`/backlog/${backlogItemId}/attachments`);
        return response.data;
    },

    uploadAttachment: async (backlogItemId: string, file: File): Promise<BacklogAttachment> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<BacklogAttachment>(`/backlog/${backlogItemId}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteAttachment: async (attachmentId: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/backlog/attachments/${attachmentId}`);
        return response.data;
    },

    // History
    getHistory: async (backlogItemId: string): Promise<BacklogHistory[]> => {
        const response = await api.get<BacklogHistory[]>(`/backlog/${backlogItemId}/history`);
        return response.data;
    },

    // Planning Poker
    startPlanningPoker: async (backlogItemId: string): Promise<PlanningPokerSession> => {
        const response = await api.post<PlanningPokerSession>(`/backlog/${backlogItemId}/planning-poker`);
        return response.data;
    },

    votePlanningPoker: async (sessionId: string, vote: number): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/backlog/planning-poker/${sessionId}/vote`, { vote });
        return response.data;
    },

    revealPlanningPoker: async (sessionId: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/backlog/planning-poker/${sessionId}/reveal`);
        return response.data;
    },

    finalizePlanningPoker: async (sessionId: string, finalEstimate: number): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/backlog/planning-poker/${sessionId}/finalize`, { finalEstimate });
        return response.data;
    },
};
