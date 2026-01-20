import { create } from "zustand";
import { BacklogItem } from "../backlog/backlog.types";

interface KanbanState {
    boardItems: BacklogItem[];
    loading: boolean;
    error: string | null;
    setBoardItems: (items: BacklogItem[]) => void;
    moveItemLocally: (id: string, toStatus: string, toPosition: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
    boardItems: [],
    loading: false,
    error: null,
    setBoardItems: (items) => set({ boardItems: items }),
    moveItemLocally: (id, toStatus, toPosition) =>
        set((state) => {
            // Very basic local move logic, probably needs refinement for real DnD
            return {
                boardItems: state.boardItems.map((item) =>
                    item.id === id ? { ...item, status: toStatus as any, position: toPosition } : item
                ),
            };
        }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
