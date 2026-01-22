export interface BacklogItem {
    id: string;
    project_id: string;
    sprint_id: string | null;
    title: string;
    description?: string;
    type: 'USER_STORY' | 'BUG' | 'TECHNICAL_TASK' | 'IMPROVEMENT';
    story_points: number | null;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    tags?: string[];
    status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
    position: number;
    assigned_to_id: string | null;
    created_by_id: string | null;
    due_date?: string;
    is_blocked?: boolean;
    started_at?: string;
    completed_at?: string;
    created_at?: string;
    updated_at?: string;
    isActive?: boolean;
}

export interface AcceptanceCriteria {
    id: string;
    backlog_item_id: string;
    description: string;
    is_completed: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface BacklogAttachment {
    id: string;
    backlog_item_id: string;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    path: string;
    uploaded_by: string;
    created_at?: string;
}

export interface BacklogHistory {
    id: string;
    backlog_item_id: string;
    user_id: string;
    action: string;
    field_changed?: string;
    old_value?: string;
    new_value?: string;
    created_at?: string;
}

export interface CreateBacklogItemDTO {
    project_id: string;
    sprint_id?: string | null;
    title: string;
    description?: string;
    type?: 'USER_STORY' | 'BUG' | 'TECHNICAL_TASK' | 'IMPROVEMENT';
    story_points?: number | null;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    tags?: string[];
    assigned_to_id?: string | null;
    due_date?: string;
}

export interface UpdateBacklogItemDTO {
    sprint_id?: string | null;
    title?: string;
    description?: string;
    type?: 'USER_STORY' | 'BUG' | 'TECHNICAL_TASK' | 'IMPROVEMENT';
    story_points?: number | null;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    tags?: string[];
    status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
    position?: number;
    assigned_to_id?: string | null;
    due_date?: string;
    is_blocked?: boolean;
}

export interface BacklogFilters {
    type?: string[];
    priority?: string[];
    tags?: string[];
    assigned_to_id?: string;
    sprint_id?: string;
    status?: string[];
    search?: string;
}

export interface BacklogSort {
    field: 'position' | 'priority' | 'story_points' | 'created_at' | 'due_date';
    direction: 'asc' | 'desc';
}

export interface PlanningPokerSession {
    id: string;
    backlog_item_id: string;
    project_id: string;
    participants: string[];
    votes: Record<string, number>;
    revealed: boolean;
    final_estimate?: number;
    created_at?: string;
    completed_at?: string;
}
