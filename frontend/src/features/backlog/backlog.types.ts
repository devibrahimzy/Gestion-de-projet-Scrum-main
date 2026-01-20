export interface BacklogItem {
    id: string;
    project_id: string;
    sprint_id: string | null;
    title: string;
    description?: string;
    type: 'USER_STORY' | 'BUG' | 'TASK';
    story_points: number;
    priority: number;
    status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
    position: number;
    assigned_to_id: string | null;
    created_by_id: string | null;
    started_at?: string;
    completed_at?: string;
}

export interface CreateBacklogItemDTO {
    project_id: string;
    sprint_id?: string | null;
    title: string;
    description?: string;
    type?: string;
    story_points?: number;
    priority?: number;
    assigned_to_id?: string | null;
}

export interface UpdateBacklogItemDTO {
    sprint_id?: string | null;
    title?: string;
    description?: string;
    type?: string;
    story_points?: number;
    priority?: number;
    status?: string;
    position?: number;
    assigned_to_id?: string | null;
}
