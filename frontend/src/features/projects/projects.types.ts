export interface Project {
    id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
    created_at?: string;
    updated_at?: string;
    isActive: boolean;
    created_by: string;
    members?: ProjectMemberWithUser[];
    sprints?: {
        current: number;
        total: number;
    };
}

export interface ProjectMember {
    id: string;
    project_id: string;
    user_id: string;
    role: 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'TEAM_MEMBER';
    joined_at?: string;
}

export interface ProjectMemberWithUser {
    role: 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'TEAM_MEMBER';
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface CreateProjectDTO {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
}

export interface UpdateProjectDTO {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
}
