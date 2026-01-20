import React, { useEffect, useState } from "react";
import { Outlet, useParams, Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { projectsService } from "@/features/projects/projects.service";
import { Project } from "@/features/projects/projects.types";

const tabs = [
  { id: "overview", label: "Overview", path: "" },
  { id: "backlog", label: "Backlog", path: "backlog" },
  { id: "sprints", label: "Sprints", path: "sprints" },
  { id: "kanban", label: "Kanban", path: "kanban" },
  { id: "members", label: "Members", path: "members" },
  { id: "analytics", label: "Analytics", path: "analytics" },
];

export const ProjectLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      projectsService.getById(id).then(setProject).catch(console.error);
    }
  }, [id]);

  const getActiveTab = () => {
    // Get the part after /projects/{id}/
    const pathParts = location.pathname.split(`/projects/${id}/`);
    const currentPath = pathParts.length > 1 ? pathParts[1] : "";
    
    // Remove any nested paths (like /tasks/details -> keep just 'tasks')
    const basePath = currentPath.split('/')[0];
    
    // Find the matching tab
    const activeTab = tabs.find(tab => {
      if (tab.path === "" && (basePath === "" || !basePath)) {
        return true; // Overview tab (empty path)
      }
      return tab.path === basePath;
    });
    
    return activeTab?.id || "overview";
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="py-6">
            {project && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : project.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {project.status === 'ACTIVE' && <CheckCircle className="h-3 w-3" />}
                        {project.status === 'PLANNING' && <Clock className="h-3 w-3" />}
                        {project.status}
                      </span>
                      {project.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Started {new Date(project.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {project.members && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {project.description && (
                  <p className="text-muted-foreground max-w-2xl">{project.description}</p>
                )}
              </div>
            )}
          </div>
          <Tabs value={activeTab} className="w-full">
            <TabsList className="h-12 w-full justify-start rounded-none border-b-0 bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  asChild
                  className="relative h-12 rounded-none border-b-2 border-transparent px-6 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <Link 
                    to={tab.path ? `/projects/${id}/${tab.path}` : `/projects/${id}`}
                    className="h-full w-full flex items-center justify-center"
                  >
                    {tab.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-12 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ProjectLayout;