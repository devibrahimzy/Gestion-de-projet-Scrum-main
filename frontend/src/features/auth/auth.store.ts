import { create } from "zustand";
import { authService } from "./auth.service";
import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from "./auth.types";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    getProfile: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    changeEmail: (newEmail: string) => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    setError: (error: string | null) => void;
    clearError: () => void;
    restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem("authToken"),
    isLoading: false,
    error: null,
    isAuthenticated: false,

    login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
        const response: AuthResponse = await authService.login(credentials);

        localStorage.setItem("authToken", response.token);
        localStorage.setItem("authUser", JSON.stringify(response.user));

        set({
            user: response.user,
            token: response.token,
            isAuthenticated: response.user.is_verified ?? false,
            isLoading: false,
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Login failed";
        set({ error: errorMessage, isLoading: false });
        throw err;
    }
},


    register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
            await authService.register(credentials);
            set({ isLoading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Registration failed";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await authService.logout();
            localStorage.removeItem("authToken");
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Logout failed";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    // Inside your useAuthStore create block:
getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
        const response: any = await authService.getProfile();
        // CHANGE THIS LINE: Access the .user property from the response
        const userData = response.user ? response.user : response; 
        
        set({ user: userData, isLoading: false });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile";
        set({ error: errorMessage, isLoading: false });
        throw err;
    }
},

    forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            await authService.forgotPassword(email);
            set({ isLoading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to send reset email";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
            await authService.resetPassword(token, newPassword);
            set({ isLoading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    verifyEmail: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
            await authService.verifyEmail(email, code);
            // Update user verification status
            set((state) => ({
                user: state.user ? { ...state.user, is_verified: true } : null,
                isAuthenticated: true,
                isLoading: false
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to verify email";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    changeEmail: async (newEmail: string) => {
        set({ isLoading: true, error: null });
        try {
            await authService.changeEmail(newEmail);
            set({ isLoading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to change email";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    changePassword: async (oldPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
            await authService.changePassword(oldPassword, newPassword);
            set({ isLoading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to change password";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    setError: (error: string | null) => {
        set({ error });
    },

    clearError: () => {
        set({ error: null });
    },

    restoreSession: () => {
        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");
        if (token && storedUser) {
            const user = JSON.parse(storedUser);
            set({ token, user, isAuthenticated: user.is_verified ?? false });

            console.log("Session restored from localStorage." , { user, token });
        }
    },
}));
