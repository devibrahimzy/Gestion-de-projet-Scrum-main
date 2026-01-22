import { create } from "zustand";
import { KanbanBoard, KanbanColumn, KanbanItem, KanbanFilters } from "./kanban.types";

interface KanbanState {
    board: KanbanBoard | null;
    columns: KanbanColumn[];
    filters: KanbanFilters;
    loading: boolean;
    error: string | null;

    // Board actions
    setBoard: (board: KanbanBoard | null) => void;
    setColumns: (columns: KanbanColumn[]) => void;
    moveItemLocally: (id: string, toStatus: string, toPosition: number) => void;
    updateItem: (id: string, updates: Partial<KanbanItem>) => void;

    // Column actions
    addColumn: (column: KanbanColumn) => void;
    updateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void;
    removeColumn: (columnId: string) => void;

    // Filter actions
    setFilters: (filters: KanbanFilters) => void;
    clearFilters: () => void;

    // UI state
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
    board: null,
    columns: [],
    filters: {},
    loading: false,
    error: null,

    setBoard: (board) => set({ board }),
    setColumns: (columns) => set({ columns }),

    moveItemLocally: (id, toStatus, toPosition) =>
        set((state) => {
            if (!state.board) return state;

            const newBoard = { ...state.board };
            const columns = [...newBoard.columns];

            // Find source column and item
            let sourceColumnIndex = -1;
            let itemIndex = -1;
            for (let i = 0; i < columns.length; i++) {
                itemIndex = columns[i].items.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    sourceColumnIndex = i;
                    break;
                }
            }

            if (sourceColumnIndex === -1 || itemIndex === -1) return state;

            // Remove item from source column
            const [movedItem] = columns[sourceColumnIndex].items.splice(itemIndex, 1);
            columns[sourceColumnIndex].item_count = columns[sourceColumnIndex].items.length;

            // Add item to destination column
            const destColumnIndex = columns.findIndex(col =>
                (col.status && col.status === toStatus) ||
                (col.name && col.name.replace(/\s+/g, '_').toUpperCase() === toStatus)
            );

            if (destColumnIndex !== -1) {
                // Insert at specific position
                columns[destColumnIndex].items.splice(toPosition, 0, {
                    ...movedItem,
                    status: toStatus,
                    position: toPosition
                });
                columns[destColumnIndex].item_count = columns[destColumnIndex].items.length;

                // Check WIP limit
                if (columns[destColumnIndex].wip_limit &&
                    columns[destColumnIndex].item_count > columns[destColumnIndex].wip_limit) {
                    columns[destColumnIndex].warning =
                        `WIP limit exceeded (${columns[destColumnIndex].item_count}/${columns[destColumnIndex].wip_limit})`;
                } else {
                    delete columns[destColumnIndex].warning;
                }
            }

            return { board: { ...newBoard, columns } };
        }),

    updateItem: (id, updates) =>
        set((state) => {
            if (!state.board) return state;

            const newBoard = { ...state.board };
            const columns = [...newBoard.columns];

            for (let i = 0; i < columns.length; i++) {
                const itemIndex = columns[i].items.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    columns[i].items[itemIndex] = { ...columns[i].items[itemIndex], ...updates };
                    break;
                }
            }

            return { board: { ...newBoard, columns } };
        }),

    addColumn: (column) =>
        set((state) => ({
            columns: [...state.columns, column]
        })),

    updateColumn: (columnId, updates) =>
        set((state) => ({
            columns: state.columns.map(col =>
                col.id === columnId ? { ...col, ...updates } : col
            )
        })),

    removeColumn: (columnId) =>
        set((state) => ({
            columns: state.columns.filter(col => col.id !== columnId)
        })),

    setFilters: (filters) => set({ filters }),
    clearFilters: () => set({ filters: {} }),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
