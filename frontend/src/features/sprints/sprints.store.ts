import { create } from "zustand";
import { Sprint } from "./sprints.types";

interface SprintsState {
    sprints: Sprint[];
    activeSprint: Sprint | null;
    loading: boolean;
    error: string | null;
    setSprints: (sprints: Sprint[]) => void;
    setActiveSprint: (sprint: Sprint | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useSprintsStore = create<SprintsState>((set) => ({
    sprints: [],
    activeSprint: null,
    loading: false,
    error: null,
    setSprints: (sprints) => set({ sprints }),
    setActiveSprint: (sprint) => set({ activeSprint: sprint }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
