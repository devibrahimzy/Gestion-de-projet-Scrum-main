import { BacklogItem } from '../backlog/backlog.types';

export interface Sprint {
    id: string;
    project_id: string;
    name: string;
    objective?: string;
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
    objective?: string;
    start_date?: string;
    end_date?: string;
    planned_velocity?: number;
}

export interface UpdateSprintDTO {
    name?: string;
    objective?: string;
    start_date?: string;
    end_date?: string;
    planned_velocity?: number;
    status?: string;
}

export interface ActiveSprintData {
    sprint: Sprint;
    items: BacklogItem[];
    capacity: {
        total: number;
        completed: number;
        remaining: number;
        progress_percentage: number;
    };
}

export interface BurndownDataPoint {
    date: string;
    remaining_story_points: number;
}

export interface BurndownChartData {
    sprint: {
        id: string;
        name: string;
        start_date: string;
        end_date: string;
        planned_velocity: number;
    };
    ideal_line: BurndownDataPoint[];
    actual_line: BurndownDataPoint[];
}

export interface VelocityDataPoint {
    name: string;
    start_date: string;
    planned_velocity: number;
    actual_velocity: number | null;
}

export interface VelocityChartData {
    sprints: VelocityDataPoint[];
    moving_average: number[];
}

export interface SprintHistory {
    id: string;
    name: string;
    objective?: string;
    start_date?: string;
    end_date?: string;
    status: 'PLANNING' | 'COMPLETED';
    planned_velocity?: number;
    actual_velocity?: number;
    completed_items: number;
    pending_items: number;
}

export interface MoveItemToSprintDTO {
    itemId: string;
}

export interface CompleteSprintDTO {
    unfinished_action: 'backlog' | 'next_sprint';
}
