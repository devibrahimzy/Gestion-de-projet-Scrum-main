import { create } from "zustand";
import type {
    BacklogItem,
    AcceptanceCriteria,
    BacklogAttachment,
    BacklogFilters,
    BacklogSort,
    PlanningPokerSession
} from "./backlog.types";

interface BacklogState {
    backlogItems: BacklogItem[];
    acceptanceCriteria: Record<string, AcceptanceCriteria[]>; // keyed by backlogItemId
    attachments: Record<string, BacklogAttachment[]>; // keyed by backlogItemId
    planningPokerSessions: Record<string, PlanningPokerSession>; // keyed by backlogItemId
    filters: BacklogFilters;
    sort: BacklogSort;
    viewMode: 'list' | 'kanban' | 'board';
    loading: boolean;
    error: string | null;

    // Actions
    setBacklogItems: (items: BacklogItem[]) => void;
    addBacklogItem: (item: BacklogItem) => void;
    updateBacklogItem: (id: string, updates: Partial<BacklogItem>) => void;
    removeBacklogItem: (id: string) => void;
    reorderBacklogItems: (itemIds: string[]) => void;

    // Acceptance Criteria
    setAcceptanceCriteria: (backlogItemId: string, criteria: AcceptanceCriteria[]) => void;
    addAcceptanceCriteria: (backlogItemId: string, criteria: AcceptanceCriteria) => void;
    updateAcceptanceCriteria: (backlogItemId: string, criteriaId: string, updates: Partial<AcceptanceCriteria>) => void;
    removeAcceptanceCriteria: (backlogItemId: string, criteriaId: string) => void;

    // Attachments
    setAttachments: (backlogItemId: string, attachments: BacklogAttachment[]) => void;
    addAttachment: (backlogItemId: string, attachment: BacklogAttachment) => void;
    removeAttachment: (backlogItemId: string, attachmentId: string) => void;

    // Planning Poker
    setPlanningPokerSession: (backlogItemId: string, session: PlanningPokerSession | null) => void;
    updatePlanningPokerSession: (backlogItemId: string, updates: Partial<PlanningPokerSession>) => void;

    // Filters and Sort
    setFilters: (filters: BacklogFilters) => void;
    setSort: (sort: BacklogSort) => void;
    setViewMode: (mode: 'list' | 'kanban' | 'board') => void;

    // Loading and Error
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useBacklogStore = create<BacklogState>((set, get) => ({
    backlogItems: [],
    acceptanceCriteria: {},
    attachments: {},
    planningPokerSessions: {},
    filters: {},
    sort: { field: 'position', direction: 'asc' },
    viewMode: 'list',
    loading: false,
    error: null,

    setBacklogItems: (items) => set({ backlogItems: items }),

    addBacklogItem: (item) => set((state) => ({
        backlogItems: [...state.backlogItems, item]
    })),

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

    reorderBacklogItems: (itemIds) => set((state) => ({
        backlogItems: itemIds.map((id, index) => {
            const item = state.backlogItems.find(i => i.id === id);
            return item ? { ...item, position: index + 1 } : null;
        }).filter(Boolean) as BacklogItem[]
    })),

    // Acceptance Criteria
    setAcceptanceCriteria: (backlogItemId, criteria) =>
        set((state) => ({
            acceptanceCriteria: { ...state.acceptanceCriteria, [backlogItemId]: criteria }
        })),

    addAcceptanceCriteria: (backlogItemId, criteria) =>
        set((state) => ({
            acceptanceCriteria: {
                ...state.acceptanceCriteria,
                [backlogItemId]: [...(state.acceptanceCriteria[backlogItemId] || []), criteria]
            }
        })),

    updateAcceptanceCriteria: (backlogItemId, criteriaId, updates) =>
        set((state) => ({
            acceptanceCriteria: {
                ...state.acceptanceCriteria,
                [backlogItemId]: (state.acceptanceCriteria[backlogItemId] || []).map(c =>
                    c.id === criteriaId ? { ...c, ...updates } : c
                )
            }
        })),

    removeAcceptanceCriteria: (backlogItemId, criteriaId) =>
        set((state) => ({
            acceptanceCriteria: {
                ...state.acceptanceCriteria,
                [backlogItemId]: (state.acceptanceCriteria[backlogItemId] || []).filter(c => c.id !== criteriaId)
            }
        })),

    // Attachments
    setAttachments: (backlogItemId, attachments) =>
        set((state) => ({
            attachments: { ...state.attachments, [backlogItemId]: attachments }
        })),

    addAttachment: (backlogItemId, attachment) =>
        set((state) => ({
            attachments: {
                ...state.attachments,
                [backlogItemId]: [...(state.attachments[backlogItemId] || []), attachment]
            }
        })),

    removeAttachment: (backlogItemId, attachmentId) =>
        set((state) => ({
            attachments: {
                ...state.attachments,
                [backlogItemId]: (state.attachments[backlogItemId] || []).filter(a => a.id !== attachmentId)
            }
        })),

    // Planning Poker
    setPlanningPokerSession: (backlogItemId, session) =>
        set((state) => ({
            planningPokerSessions: {
                ...state.planningPokerSessions,
                [backlogItemId]: session || undefined
            }
        })),

    updatePlanningPokerSession: (backlogItemId, updates) =>
        set((state) => ({
            planningPokerSessions: {
                ...state.planningPokerSessions,
                [backlogItemId]: state.planningPokerSessions[backlogItemId]
                    ? { ...state.planningPokerSessions[backlogItemId], ...updates }
                    : undefined
            }
        })),

    // Filters and Sort
    setFilters: (filters) => set({ filters }),
    setSort: (sort) => set({ sort }),
    setViewMode: (mode) => set({ viewMode: mode }),

    // Loading and Error
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
