import api from "@/shared/api/client";
import { Comment, CreateCommentDTO } from "./comments.types";

export const commentsService = {
    getByItem: async (itemId: string): Promise<Comment[]> => {
        const response = await api.get<Comment[]>(`/comments/${itemId}`);
        return response.data;
    },

    add: async (data: CreateCommentDTO): Promise<Comment> => {
        const response = await api.post<Comment>("/comments", data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/comments/${id}`);
        return response.data;
    },
};
