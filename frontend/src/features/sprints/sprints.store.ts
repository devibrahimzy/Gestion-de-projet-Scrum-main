import { create } from "zustand";
import { Sprint, ActiveSprintData, BurndownChartData, VelocityChartData } from "./sprints.types";

interface SprintsState {
    sprints: Sprint[];
    activeSprintData: ActiveSprintData | null;
    burndownData: BurndownChartData | null;
    velocityData: VelocityChartData | null;
    loading: boolean;
    error: string | null;
    setSprints: (sprints: Sprint[]) => void;
    setActiveSprintData: (data: ActiveSprintData | null) => void;
    setBurndownData: (data: BurndownChartData | null) => void;
    setVelocityData: (data: VelocityChartData | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
    addSprint: (sprint: Sprint) => void;
    removeSprint: (sprintId: string) => void;
}

export const useSprintsStore = create<SprintsState>((set, get) => ({
    sprints: [],
    activeSprintData: null,
    burndownData: null,
    velocityData: null,
    loading: false,
    error: null,
    setSprints: (sprints) => set({ sprints }),
    setActiveSprintData: (activeSprintData) => set({ activeSprintData }),
    setBurndownData: (burndownData) => set({ burndownData }),
    setVelocityData: (velocityData) => set({ velocityData }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    updateSprint: (sprintId, updates) => set((state) => ({
        sprints: state.sprints.map(s => s.id === sprintId ? { ...s, ...updates } : s),
        activeSprintData: state.activeSprintData?.sprint.id === sprintId
            ? { ...state.activeSprintData, sprint: { ...state.activeSprintData.sprint, ...updates } }
            : state.activeSprintData
    })),
    addSprint: (sprint) => set((state) => ({
        sprints: [sprint, ...state.sprints]
    })),
    removeSprint: (sprintId) => set((state) => ({
        sprints: state.sprints.filter(s => s.id !== sprintId),
        activeSprintData: state.activeSprintData?.sprint.id === sprintId ? null : state.activeSprintData
    })),
}));
