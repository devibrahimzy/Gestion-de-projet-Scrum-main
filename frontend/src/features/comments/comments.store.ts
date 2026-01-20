import { create } from "zustand";
import { Comment } from "./comments.types";

interface CommentsState {
    commentsByItem: Record<string, Comment[]>;
    loading: boolean;
    error: string | null;
    setComments: (itemId: string, comments: Comment[]) => void;
    addComment: (comment: Comment) => void;
    removeComment: (id: string, itemId: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useCommentsStore = create<CommentsState>((set) => ({
    commentsByItem: {},
    loading: false,
    error: null,
    setComments: (itemId, comments) =>
        set((state) => ({
            commentsByItem: { ...state.commentsByItem, [itemId]: comments },
        })),
    addComment: (comment) =>
        set((state) => {
            const existing = state.commentsByItem[comment.item_id] || [];
            return {
                commentsByItem: {
                    ...state.commentsByItem,
                    [comment.item_id]: [...existing, comment],
                },
            };
        }),
    removeComment: (id, itemId) =>
        set((state) => ({
            commentsByItem: {
                ...state.commentsByItem,
                [itemId]: (state.commentsByItem[itemId] || []).filter((c) => c.id !== id),
            },
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
