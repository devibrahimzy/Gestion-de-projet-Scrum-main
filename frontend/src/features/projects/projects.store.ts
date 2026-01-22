import { create } from "zustand";
import { Project, ProjectFilters } from "./projects.types";

interface ProjectsState {
    projects: Project[];
    currentProject: Project | null;
    loading: boolean;
    error: string | null;
    filters: ProjectFilters;
    setProjects: (projects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setFilters: (filters: ProjectFilters) => void;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    removeProject: (projectId: string) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    filters: {},
    setProjects: (projects) => set({ projects }),
    setCurrentProject: (project) => set({ currentProject: project }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set({ filters }),
    updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, ...updates } : p),
        currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, ...updates } : state.currentProject
    })),
    removeProject: (projectId) => set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject
    })),
}));
