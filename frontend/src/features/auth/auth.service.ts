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

 resetPassword: async (code: string, newPassword: string, email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("auth/reset-password", { code, newPassword, email });
    return response.data;
 },

verifyEmail: async (email: string, code: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("auth/verify", { email, code });
    return response.data;
},

changeEmail: async (newEmail: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>("auth/change-email", { new_email: newEmail });
    return response.data;
},

 changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>("auth/change-password", { old_password: oldPassword, new_password: newPassword });
    return response.data;
  },

  updateProfile: async (data: { first_name?: string; last_name?: string; profile_photo?: string }): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>("auth/profile", data);
    return response.data;
  },

    
};
