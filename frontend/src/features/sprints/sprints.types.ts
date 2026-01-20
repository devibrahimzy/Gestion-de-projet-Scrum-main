export interface Sprint {
    id: string;
    project_id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
    planned_velocity?: number;
    actual_velocity?: number;
    isActive: boolean;
}

export interface CreateSprintDTO {
    project_id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    planned_velocity?: number;
}

export interface UpdateSprintDTO {
    name?: string;
    start_date?: string;
    end_date?: string;
    planned_velocity?: number;
    status?: string;
}
