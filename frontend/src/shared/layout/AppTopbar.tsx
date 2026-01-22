import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useProjectsStore } from "@/features/projects/projects.store";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  Button,
} from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Input
} from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

export const AppTopbar: React.FC = () => {
  const location = useLocation();
  const { currentProject } = useProjectsStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs = [];

    breadcrumbs.push({
      label: "Home",
      path: "/projects",
    });

    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
      const isLast = index === pathnames.length - 1;

      // Check if this pathname is a UUID (project ID) and we have currentProject
      const isProjectId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name);
      let label = name.charAt(0).toUpperCase() + name.slice(1);

      if (isProjectId && currentProject && routeTo.includes(currentProject.id)) {
        label = currentProject.name;
      } else if (isProjectId) {
        label = "Project";
      }

      breadcrumbs.push({
        label,
        path: routeTo,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Determine if we're in a project context
  const isProjectView = location.pathname.includes('/project/');
  const projectId = isProjectView ? location.pathname.split('/project/')[1]?.split('/')[0] : null;

  // Define navigation tabs for project view
  const projectTabs = [
    { id: "overview", label: "Overview", path: `/project/${projectId}` },
    { id: "tasks", label: "Tasks", path: `/project/${projectId}/tasks` },
    { id: "issues", label: "Issues", path: `/project/${projectId}/issues` },
    { id: "milestones", label: "Milestones", path: `/project/${projectId}/milestones` },
    { id: "team", label: "Team", path: `/project/${projectId}/team` },
    { id: "settings", label: "Settings", path: `/project/${projectId}/settings` },
  ];

  // Determine active tab
  const getActiveTab = () => {
    if (!isProjectView) return "";
    
    const path = location.pathname;
    if (path.includes('/tasks')) return "tasks";
    if (path.includes('/issues')) return "issues";
    if (path.includes('/milestones')) return "milestones";
    if (path.includes('/team')) return "team";
    if (path.includes('/settings')) return "settings";
    return "overview"; // Default to overview
  };

  const activeTab = getActiveTab();

  return (
    <div className="border-b border-border bg-background">
      <div className="flex flex-col">
        {/* Top row with breadcrumbs and user menu */}
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.path}>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.path}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!crumb.isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          <div className="flex items-center gap-4">
           
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation tabs for project view */}
        {isProjectView && projectId && (
          <div className="border-t border-border px-6">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="h-12 w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                {projectTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    asChild
                    className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <Link to={tab.path}>
                      {tab.label}
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};