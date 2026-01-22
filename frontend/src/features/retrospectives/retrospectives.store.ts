import { create } from "zustand";
import { Retrospective, RetroItem, UserVotingStatus, RetroSettings } from "./retrospectives.types";

interface RetrospectivesState {
    currentRetro: Retrospective | null;
    history: Retrospective[];
    userVotingStatus: UserVotingStatus | null;
    settings: RetroSettings | null;
    loading: boolean;
    error: string | null;

    // Retrospective actions
    setCurrentRetro: (retro: Retrospective | null) => void;
    setHistory: (history: Retrospective[]) => void;
    updateRetro: (updates: Partial<Retrospective>) => void;

    // Item actions
    addRetroItem: (item: RetroItem) => void;
    updateRetroItem: (id: string, updates: Partial<RetroItem>) => void;
    removeRetroItem: (id: string) => void;

    // Voting actions
    setUserVotingStatus: (status: UserVotingStatus | null) => void;
    updateVotingStatus: (category: string, votesUsed: number) => void;
    resetVotingStatus: () => void;

    // Settings actions
    setSettings: (settings: RetroSettings | null) => void;
    updateSettings: (settings: Partial<RetroSettings>) => void;

    // UI state
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Computed getters
    getItemsByCategory: (category: string) => RetroItem[];
    getSortedItemsByCategory: (category: string) => RetroItem[];
    canUserVote: (category: string) => boolean;
    getRemainingVotes: (category: string) => number;
}

export const useRetrospectivesStore = create<RetrospectivesState>((set, get) => ({
    currentRetro: null,
    history: [],
    userVotingStatus: null,
    settings: null,
    loading: false,
    error: null,

    setCurrentRetro: (retro) => set({ currentRetro: retro }),
    setHistory: (history) => set({ history }),
    updateRetro: (updates) =>
        set((state) => ({
            currentRetro: state.currentRetro ? { ...state.currentRetro, ...updates } : null
        })),

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

    setUserVotingStatus: (status) => set({ userVotingStatus: status }),
    updateVotingStatus: (category, votesUsed) =>
        set((state) => {
            if (!state.userVotingStatus) return state;
            return {
                userVotingStatus: {
                    ...state.userVotingStatus,
                    votes_used: {
                        ...state.userVotingStatus.votes_used,
                        [category]: votesUsed
                    }
                }
            };
        }),
    resetVotingStatus: () => set({ userVotingStatus: null }),

    setSettings: (settings) => set({ settings }),
    updateSettings: (newSettings) =>
        set((state) => ({
            settings: state.settings ? { ...state.settings, ...newSettings } : newSettings
        })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Computed getters
    getItemsByCategory: (category) => {
        const state = get();
        return state.currentRetro?.items?.filter(item => item.category === category) || [];
    },

    getSortedItemsByCategory: (category) => {
        const state = get();
        const items = state.currentRetro?.items?.filter(item => item.category === category) || [];
        return items.sort((a, b) => b.votes - a.votes);
    },

    canUserVote: (category) => {
        const state = get();
        if (!state.userVotingStatus || !state.settings) return false;

        const votesUsed = state.userVotingStatus.votes_used[category] || 0;
        const votesPerUser = state.settings.votes_per_user;
        const remaining = state.userVotingStatus.remaining_votes[category] || 0;

        return remaining > 0 && (!state.settings.allow_multiple_votes ? votesUsed < votesPerUser : true);
    },

    getRemainingVotes: (category) => {
        const state = get();
        return state.userVotingStatus?.remaining_votes[category] || 0;
    },
}));
