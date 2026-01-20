import { create } from "zustand";
import { DashboardSummary, VelocityData, AgilePerformance } from "./dashboard.types";

interface DashboardState {
    summary: DashboardSummary | null;
    velocity: VelocityData[];
    performance: AgilePerformance | null;
    loading: boolean;
    error: string | null;
    setSummary: (summary: DashboardSummary) => void;
    setVelocity: (velocity: VelocityData[]) => void;
    setPerformance: (performance: AgilePerformance) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    summary: null,
    velocity: [],
    performance: null,
    loading: false,
    error: null,
    setSummary: (summary) => set({ summary }),
    setVelocity: (velocity) => set({ velocity }),
    setPerformance: (performance) => set({ performance }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
