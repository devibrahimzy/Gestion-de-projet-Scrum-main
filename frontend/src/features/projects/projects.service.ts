import api from "@/shared/api/client";
import { Project, ProjectMember, ProjectMemberWithUser, CreateProjectDTO, UpdateProjectDTO } from "./projects.types";

export const projectsService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>("/projects");
        return response.data;
    },

    getMyProjects: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>("/projects/my-projects");
        return response.data;
    },

    getById: async (id: string): Promise<Project> => {
        const response = await api.get<Project>(`/projects/${id}`);
        return response.data;
    },

    create: async (data: CreateProjectDTO): Promise<{ message: string; project: Project }> => {
        const response = await api.post<{ message: string; project: Project }>("/projects", data);
        return response.data;
    },

    update: async (id: string, data: UpdateProjectDTO): Promise<{ message: string; project: Project }> => {
        const response = await api.put<{ message: string; project: Project }>(`/projects/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/projects/${id}`);
        return response.data;
    },

    getMembers: async (id: string): Promise<ProjectMemberWithUser[]> => {
        const response = await api.get<ProjectMemberWithUser[]>(`/projects/${id}/members`);
        return response.data;
    },

    addMember: async (data: { project_id: string; user_id: string; role: 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'TEAM_MEMBER' }): Promise<ProjectMemberWithUser> => {
        const response = await api.post<ProjectMemberWithUser>("/projects/members", data);
        return response.data;
    },

    removeMember: async (projectId: string, userId: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/projects/${projectId}/members/${userId}`);
        return response.data;
    },
};
