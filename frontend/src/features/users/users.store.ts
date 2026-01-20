import { create } from "zustand";
import { User } from "../auth/auth.types";

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
    setUsers: (users: User[]) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    removeUser: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
    users: [],
    loading: false,
    error: null,
    setUsers: (users) => set({ users }),
    updateUser: (id, updates) =>
        set((state) => ({
            users: state.users.map((user) =>
                user.id === id ? { ...user, ...updates } : user
            ),
        })),
    removeUser: (id) =>
        set((state) => ({
            users: state.users.filter((user) => user.id !== id),
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
