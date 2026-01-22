import { create } from "zustand";
import { DashboardSummary, VelocityData, AgilePerformance, BurndownData, HealthIndicators, MemberWorkload, VelocityComparison, CurrentSprint } from "./dashboard.types";

interface DashboardState {
    summary: DashboardSummary | null;
    currentSprint: CurrentSprint | null;
    velocity: VelocityData[];
    velocityComparison: VelocityComparison | null;
    performance: AgilePerformance | null;
    burndownData: BurndownData[];
    workload: MemberWorkload[];
    healthIndicators: HealthIndicators | null;
    loading: boolean;
    error: string | null;
    setSummary: (summary: DashboardSummary) => void;
    setCurrentSprint: (currentSprint: CurrentSprint | null) => void;
    setVelocity: (velocity: VelocityData[]) => void;
    setVelocityComparison: (velocityComparison: VelocityComparison) => void;
    setPerformance: (performance: AgilePerformance) => void;
    setBurndownData: (burndownData: BurndownData[]) => void;
    setWorkload: (workload: MemberWorkload[]) => void;
    setHealthIndicators: (healthIndicators: HealthIndicators) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    summary: null,
    currentSprint: null,
    velocity: [],
    velocityComparison: null,
    performance: null,
    burndownData: [],
    workload: [],
    healthIndicators: null,
    loading: false,
    error: null,
    setSummary: (summary) => set({ summary }),
    setCurrentSprint: (currentSprint) => set({ currentSprint }),
    setVelocity: (velocity) => set({ velocity }),
    setVelocityComparison: (velocityComparison) => set({ velocityComparison }),
    setPerformance: (performance) => set({ performance }),
    setBurndownData: (burndownData) => set({ burndownData }),
    setWorkload: (workload) => set({ workload }),
    setHealthIndicators: (healthIndicators) => set({ healthIndicators }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
