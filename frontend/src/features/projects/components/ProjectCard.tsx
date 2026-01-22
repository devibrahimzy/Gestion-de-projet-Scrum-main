import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Users, Calendar, CheckCircle, MoreVertical, Edit, Trash2, Target, Settings } from "lucide-react";
import { Project } from "../projects.types";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onArchive, onDelete }) => {
  const sprintProgress = project.sprints ? (project.sprints.current / project.sprints.total) * 100 : 0;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/projects/${project.id}`}>
        <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    {project.methodology}
                  </Badge>
                  {project.progress !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {project.progress}% Complete
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant={project.isActive ? "default" : "secondary"}>
                {project.status}
              </Badge>
            </div>
          {project.description && (
            <CardDescription className="line-clamp-2 mt-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            {project.objectives && project.objectives.length > 0 && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-xs">
                  {project.objectives.length} objective{project.objectives.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {project.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Project Progress</span>
                  <span className="font-medium text-foreground">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            )}

            {project.sprints && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Sprint Progress</span>
                  <span className="font-medium text-foreground">
                    {project.sprints.current} / {project.sprints.total}
                  </span>
                </div>
                <Progress value={sprintProgress} className="h-2" />
              </div>
            )}

            {project.members && project.members.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 4).map((member) => (
                    <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(member.first_name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members.length > 4 && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted border-2 border-background text-[10px] font-medium">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs">
                  {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {project.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  Started: {new Date(project.start_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between items-center">
        <Button variant="ghost" className="flex-1 justify-start" asChild>
          <Link to={`/projects/${project.id}`}>
            <span>
              View Dashboard
              <CheckCircle className="h-4 w-4 ml-2" />
            </span>
          </Link>
        </Button>
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               {onEdit && (
                 <DropdownMenuItem onClick={(e) => {
                   e.preventDefault();
                   onEdit(project);
                 }}>
                   <Edit className="h-4 w-4 mr-2" />
                   Edit
                 </DropdownMenuItem>
               )}
               {onArchive && project.status !== 'ARCHIVED' && (
                 <DropdownMenuItem onClick={(e) => {
                   e.preventDefault();
                   onArchive(project);
                 }}>
                   <Edit className="h-4 w-4 mr-2" />
                   Archive
                 </DropdownMenuItem>
               )}
               {onDelete && (
                 <DropdownMenuItem
                   onClick={(e) => {
                     e.preventDefault();
                     onDelete(project);
                   }}
                   className="text-destructive focus:text-destructive"
                 >
                   <Trash2 className="h-4 w-4 mr-2" />
                   Delete
                 </DropdownMenuItem>
               )}
             </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
