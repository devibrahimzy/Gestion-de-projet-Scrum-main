import { create } from "zustand";
import { Project } from "./projects.types";

interface ProjectsState {
    projects: Project[];
    currentProject: Project | null;
    loading: boolean;
    error: string | null;
    setProjects: (projects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    setProjects: (projects) => set({ projects }),
    setCurrentProject: (project) => set({ currentProject: project }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
