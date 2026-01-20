export interface DashboardSummary {
    projectDetails: any;
    backlogStats: {
        totalItems: number;
        completedItems: number;
        completionRate: number;
        totalStoryPoints: number;
    };
    sprintStats: {
        totalSprints: number;
        activeSprints: number;
        completedSprints: number;
    };
    teamStats: {
        totalMembers: number;
    };
}

export interface VelocityData {
    sprintName: string;
    planned: number;
    actual: number;
}

export interface AgilePerformance {
    burndownData: any[];
    cycleTime: number;
    leadTime: number;
}
