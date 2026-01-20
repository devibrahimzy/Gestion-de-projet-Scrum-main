import api from "../../shared/api/client";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "./auth.types";

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("auth/login", credentials);
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("auth/register", credentials);
        return response.data;
    },

    logout: async (): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("auth/logout");
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<User>("auth/profile");
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ message: string; token?: string }> => {
        const response = await api.post<{ message: string; token?: string }>("auth/forgot-password", { email });
        return response.data;
    },

resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("auth/reset-password", { token, newPassword });
        return response.data;
    },

    
};
