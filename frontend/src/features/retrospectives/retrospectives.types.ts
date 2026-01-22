export interface Retrospective {
    id: string;
    sprint_id: string;
    sprint_name?: string;
    date: string;
    status: 'DRAFT' | 'PUBLISHED';
    facilitator_id: string | null;
    facilitator_name?: string;
    is_anonymous: boolean;
    votes_per_user: number;
    allow_multiple_votes: boolean;
    created_at: string;
    updated_at?: string;
    items?: RetroItem[];
}

export interface RetroItem {
    id: string;
    retrospective_id: string;
    author_id: string;
    author_name?: string;
    text: string;
    category: 'POSITIVE' | 'IMPROVE' | 'ACTION';
    votes: number;
    user_votes?: RetroVote[];
    is_completed: boolean;
    assigned_to_id?: string;
    assigned_to_name?: string;
    due_date?: string;
    created_at: string;
    updated_at?: string;
}

export interface RetroVote {
    id: string;
    retro_item_id: string;
    user_id: string;
    created_at: string;
}

export interface RetroActionItem extends RetroItem {
    assigned_to_id: string;
    assigned_to_name: string;
    due_date: string;
    is_completed: boolean;
}

export interface UserVotingStatus {
    user_id: string;
    votes_used: Record<string, number>; // category -> votes used
    total_votes: number;
    remaining_votes: Record<string, number>; // category -> remaining votes
}

export interface RetroSettings {
    is_anonymous: boolean;
    votes_per_user: number;
    allow_multiple_votes: boolean;
}

export interface CreateRetroDTO {
    sprint_id: string;
    date: string;
    facilitator_id?: string;
    is_anonymous?: boolean;
    votes_per_user?: number;
    allow_multiple_votes?: boolean;
}

export interface CreateRetroItemDTO {
    retrospective_id: string;
    text: string;
    category: 'POSITIVE' | 'IMPROVE' | 'ACTION';
}

export interface UpdateRetroItemDTO {
    text?: string;
    assigned_to_id?: string;
    due_date?: string;
    is_completed?: boolean;
}

export interface RetroExportData {
    retrospective: Retrospective;
    items: RetroItem[];
    summary: {
        total_items: number;
        total_votes: number;
        completed_actions: number;
        pending_actions: number;
    };
}

export interface RetroTrendsData {
    sprint_name: string;
    date: string;
    positive_count: number;
    improve_count: number;
    action_count: number;
    total_votes: number;
    completion_rate: number;
}
