import { create } from "zustand";
import type { BacklogItem } from "./backlog.types";

interface BacklogState {
    backlogItems: BacklogItem[];
    loading: boolean;
    error: string | null;
    setBacklogItems: (items: BacklogItem[]) => void;
    addBacklogItem: (item: BacklogItem) => void;
    updateBacklogItem: (id: string, updates: Partial<BacklogItem>) => void;
    removeBacklogItem: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useBacklogStore = create<BacklogState>((set) => ({
    backlogItems: [],
    loading: false,
    error: null,
    setBacklogItems: (items) => set({ backlogItems: items }),
    addBacklogItem: (item) => set((state) => ({ backlogItems: [...state.backlogItems, item] })),
    updateBacklogItem: (id, updates) =>
        set((state) => ({
            backlogItems: state.backlogItems.map((item) =>
                item.id === id ? { ...item, ...updates } : item
            ),
        })),
    removeBacklogItem: (id) =>
        set((state) => ({
            backlogItems: state.backlogItems.filter((item) => item.id !== id),
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
