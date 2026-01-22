import api from "@/shared/api/client";
import { Project, ProjectMember, ProjectMemberWithUser, CreateProjectDTO, UpdateProjectDTO, ProjectFilters } from "./projects.types";

export const projectsService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>("/projects");
        return response.data;
    },

    getMyProjects: async (filters?: ProjectFilters): Promise<Project[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

        const response = await api.get<Project[]>(`/projects/my-projects?${params.toString()}`);
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

    archive: async (id: string): Promise<{ message: string; project: Project }> => {
        const response = await api.put<{ message: string; project: Project }>(`/projects/${id}/archive`);
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

    inviteMember: async (data: { project_id: string; email: string; role: 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'TEAM_MEMBER' }): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("/projects/invite", data);
        return response.data;
    },

    updateMemberRole: async (projectId: string, userId: string, role: 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'TEAM_MEMBER'): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>(`/projects/${projectId}/members/${userId}/role`, { role });
        return response.data;
    },

    acceptInvitation: async (token: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("/projects/accept-invitation", { token });
        return response.data;
    },

    refuseInvitation: async (token: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("/projects/refuse-invitation", { token });
        return response.data;
    },
};
