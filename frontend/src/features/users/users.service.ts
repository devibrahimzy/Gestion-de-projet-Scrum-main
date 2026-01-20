import api from "@/shared/api/client";
import { User } from "../auth/auth.types";

export interface UpdateUserDTO {
    first_name?: string;
    last_name?: string;
    role?: string;
    isActive?: boolean;
}

export const usersService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<User[]>("/users");
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    update: async (id: string, data: UpdateUserDTO): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/users/${id}`);
        return response.data;
    },
};
