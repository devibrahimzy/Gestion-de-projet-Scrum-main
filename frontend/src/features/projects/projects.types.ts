export interface Project {
    id: string;
    name: string;
    description: string;
    objectives: string[];
    methodology: 'SCRUM' | 'KANBAN';
    sprint_duration: 1 | 2 | 3 | 4;
    start_date: string;
    end_date?: string;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    created_at?: string;
    updated_at?: string;
    isActive: boolean;
    created_by: string;
    members?: ProjectMemberWithUser[];
    sprints?: {
        current: number;
        total: number;
    };
    progress?: number; // 0-100
    total_tasks?: number;
    completed_tasks?: number;
    overdue_tasks?: number;
    average_velocity?: number;
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
    status?: 'MEMBER' | 'INVITED';
}

export interface CreateProjectDTO {
    name: string;
    description: string;
    objectives: string[];
    methodology: 'SCRUM' | 'KANBAN';
    sprint_duration: 1 | 2 | 3 | 4;
    start_date: string;
}

export interface UpdateProjectDTO {
    name?: string;
    description?: string;
    objectives?: string[];
    methodology?: 'SCRUM' | 'KANBAN';
    sprint_duration?: 1 | 2 | 3 | 4;
    start_date?: string;
    end_date?: string;
    status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface ProjectFilters {
    status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    sortBy?: 'name' | 'created_at' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
}
