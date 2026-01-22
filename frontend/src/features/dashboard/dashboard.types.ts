export interface DashboardSummary {
    project_name: string;
    total_items: number;
    completed_items: number;
    in_progress_items: number;
    todo_items: number;
    overdue_items: number;
    total_story_points: number;
    completed_story_points: number;
}

export interface CurrentSprint {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    completed_story_points: number;
    days_remaining: number;
}

export interface MemberWorkload {
    id: number;
    first_name: string;
    last_name: string;
    assigned_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    total_story_points: number;
    completed_story_points: number;
}

export interface VelocityData {
    name: string;
    planned_velocity: number;
    actual_velocity: number;
}

export interface SprintData {
    name: string;
    status: string;
    total_tasks: number;
    done_tasks: number;
}

export interface AnalyticsResponse {
    summary: DashboardSummary;
    currentSprint: CurrentSprint | null;
    workload: MemberWorkload[];
    velocity: VelocityData[];
    velocityComparison: VelocityComparison;
    agile: AgilePerformance;
    sprints: SprintData[];
    health: HealthIndicators;
}

export interface VelocityComparison {
    avg_velocity: number;
    current_velocity: number;
}

export interface AgilePerformance {
    avg_lead_time_hours: number;
    avg_cycle_time_hours: number;
}

export interface BurndownData {
    date: string;
    completed_tasks: number;
    completed_points: number;
}

export interface HealthIndicators {
    overdue_tasks: number;
    total_bugs: number;
    resolved_bugs: number;
    avg_velocity: number;
    velocity_stddev: number;
}
