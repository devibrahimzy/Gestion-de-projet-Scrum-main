export interface Retrospective {
    id: string;
    sprint_id: string;
    date: string;
    status: 'DRAFT' | 'PUBLISHED';
    facilitator_id: string | null;
    created_at: string;
    items?: RetroItem[];
}

export interface RetroItem {
    id: string;
    retrospective_id: string;
    author_id: string;
    text: string;
    category: 'POSITIVE' | 'IMPROVE' | 'ACTION';
    votes: number;
    is_completed: boolean;
    created_at: string;
}

export interface CreateRetroDTO {
    sprint_id: string;
    date: string;
    facilitator_id?: string;
}

export interface CreateRetroItemDTO {
    retrospective_id: string;
    text: string;
    category: 'POSITIVE' | 'IMPROVE' | 'ACTION';
}
