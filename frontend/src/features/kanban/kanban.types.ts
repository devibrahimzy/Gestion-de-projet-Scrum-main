export interface KanbanColumn {
    id?: string;
    name: string;
    status?: string;
    position: number;
    wip_limit?: number;
    project_id?: string;
    items: KanbanItem[];
    item_count: number;
    warning?: string;
}

export interface KanbanItem {
    id: string;
    title: string;
    description?: string;
    status: string;
    position: number;
    story_points?: number;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'USER_STORY' | 'BUG' | 'TECHNICAL_TASK' | 'IMPROVEMENT';
    tags?: string[];
    assigned_to_id?: string;
    assigned_user?: {
        first_name: string;
        last_name: string;
        profile_photo?: string;
    };
    unique_id: string;
    comment_count: number;
    is_overdue: boolean;
    is_blocked: boolean;
    due_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface KanbanBoard {
    columns: KanbanColumn[];
    total_items: number;
}

export interface KanbanFilters {
    assigned_to_id?: string;
    type?: string;
    priority?: string;
    tags?: string;
}

export interface CreateKanbanColumnDTO {
    name: string;
    wip_limit?: number;
}

export interface UpdateKanbanColumnDTO {
    name?: string;
    wip_limit?: number;
}

export interface KanbanMoveDTO {
    toStatus: string;
    toPosition: number;
    toSprintId?: string;
}