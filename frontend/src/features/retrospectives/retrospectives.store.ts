import { create } from "zustand";
import { Retrospective, RetroItem } from "./retrospectives.types";

interface RetrospectivesState {
    currentRetro: Retrospective | null;
    history: Retrospective[];
    loading: boolean;
    error: string | null;
    setCurrentRetro: (retro: Retrospective | null) => void;
    setHistory: (history: Retrospective[]) => void;
    addRetroItem: (item: RetroItem) => void;
    updateRetroItem: (id: string, updates: Partial<RetroItem>) => void;
    removeRetroItem: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useRetrospectivesStore = create<RetrospectivesState>((set) => ({
    currentRetro: null,
    history: [],
    loading: false,
    error: null,
    setCurrentRetro: (retro) => set({ currentRetro: retro }),
    setHistory: (history) => set({ history }),
    addRetroItem: (item) =>
        set((state) => {
            if (!state.currentRetro) return state;
            return {
                currentRetro: {
                    ...state.currentRetro,
                    items: [...(state.currentRetro.items || []), item],
                },
            };
        }),
    updateRetroItem: (id, updates) =>
        set((state) => {
            if (!state.currentRetro) return state;
            return {
                currentRetro: {
                    ...state.currentRetro,
                    items: (state.currentRetro.items || []).map((item) =>
                        item.id === id ? { ...item, ...updates } : item
                    ),
                },
            };
        }),
    removeRetroItem: (id) =>
        set((state) => {
            if (!state.currentRetro) return state;
            return {
                currentRetro: {
                    ...state.currentRetro,
                    items: (state.currentRetro.items || []).filter((item) => item.id !== id),
                },
            };
        }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
