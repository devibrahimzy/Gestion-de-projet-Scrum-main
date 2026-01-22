import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project } from '@/features/projects/projects.types';
import { projectsService } from '@/features/projects/projects.service';
import { useAuthStore } from '@/features/auth/auth.store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Loader2, Plus, Search, Grid3x3, List, LayoutGrid, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { Skeleton } from '@/shared/components/ui/skeleton';

const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100, 'Project name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  objectives: z.array(z.string().min(1, 'Objective cannot be empty')).min(3, 'At least 3 objectives are required'),
  methodology: z.enum(['SCRUM', 'KANBAN']),
  sprint_duration: z.number().min(1).max(4),
  start_date: z.string().min(1, 'Start date is required'),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

type ViewMode = 'grid' | 'list';

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [archivingProject, setArchivingProject] = useState<Project | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      objectives: ['', '', ''],
      methodology: 'SCRUM',
      sprint_duration: 2,
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  // Reset form when editing project changes
  useEffect(() => {
    if (editingProject) {
      form.reset({
        name: editingProject.name,
        description: editingProject.description,
        objectives: editingProject.objectives || ['', '', ''],
        methodology: editingProject.methodology,
        sprint_duration: editingProject.sprint_duration,
        start_date: editingProject.start_date.split('T')[0],
      });
    } else {
      form.reset({
        name: '',
        description: '',
        objectives: ['', '', ''],
        methodology: 'SCRUM',
        sprint_duration: 2,
        start_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [editingProject, form]);

  useEffect(() => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectsService.getMyProjects({
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy,
        sortOrder,
      });
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onSubmit = async (values: CreateProjectFormValues) => {
    try {
      setIsCreating(true);
      setCreateError(null);

      if (editingProject) {
        await projectsService.update(editingProject.id, {
          name: values.name,
          description: values.description,
          objectives: values.objectives,
          methodology: values.methodology,
          sprint_duration: values.sprint_duration,
          start_date: values.start_date,
        });
      } else {
        await projectsService.create({
          name: values.name,
          description: values.description,
          objectives: values.objectives,
          methodology: values.methodology,
          sprint_duration: values.sprint_duration,
          start_date: values.start_date,
        });
      }

      await fetchProjects();

      setIsDialogOpen(false);
      setEditingProject(null);
      form.reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingProject ? 'update' : 'create'} project`;
      setCreateError(errorMessage);
      console.error(`Error ${editingProject ? 'updating' : 'creating'} project:`, err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleArchive = async () => {
    if (!archivingProject) return;

    try {
      await projectsService.archive(archivingProject.id);
      await fetchProjects();
      setArchivingProject(null);
    } catch (err) {
      console.error('Error archiving project:', err);
      // Could add error toast here
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;

    try {
      await projectsService.delete(deletingProject.id);
      await fetchProjects();
      setDeletingProject(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      // Could add error toast here
    }
  };

  const handleJoinProject = async () => {
    if (!joinCode.trim()) return;

    try {
      setIsJoining(true);
      setJoinError(null);
      await projectsService.acceptInvitation(joinCode.trim());
      await fetchProjects();
      setIsJoinDialogOpen(false);
      setJoinCode('');
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to join project';
      setJoinError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">Manage and view all your projects</p>
        </div>
                   <div className="flex gap-2">
                     {user?.role === 'TEAM_MEMBER' ? (
                       <Dialog
                         open={isJoinDialogOpen}
                         onOpenChange={setIsJoinDialogOpen}
                       >
                         <DialogTrigger asChild>
                           <Button variant="outline" size="lg" className="gap-2">
                             <Plus className="h-4 w-4" />
                             Join Project
                           </Button>
                         </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join Project</DialogTitle>
                            <DialogDescription>
                              Enter the invitation code you received to join a project.
                            </DialogDescription>
                          </DialogHeader>
                          {joinError && (
                            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                              {joinError}
                            </div>
                          )}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label htmlFor="join-code" className="text-sm font-medium">
                                Invitation Code
                              </label>
                              <Input
                                id="join-code"
                                placeholder="Enter invitation code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                disabled={isJoining}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleJoinProject}
                                disabled={!joinCode.trim() || isJoining}
                                className="flex-1"
                              >
                                {isJoining ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Joining...
                                  </>
                                ) : (
                                  'Join Project'
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsJoinDialogOpen(false);
                                  setJoinCode('');
                                  setJoinError(null);
                                }}
                                disabled={isJoining}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                         <DialogTrigger asChild>
                           <Button size="lg" className="gap-2">
                             <Plus className="h-4 w-4" />
                             Create Project
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-[600px]">
                           <DialogHeader>
                             <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                             <DialogDescription>
                               {editingProject ? 'Update your project details below.' : 'Fill in the details to create a new project.'}
                             </DialogDescription>
                           </DialogHeader>
                           {createError && (
                             <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                               {createError}
                             </div>
                           )}
                           <Form {...form}>
                             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                               <FormField
                                 control={form.control}
                                 name="name"
                                 render={({ field }) => (
                                   <FormItem>
                                     <FormLabel>Project Name</FormLabel>
                                     <FormControl>
                                       <Input placeholder="Enter project name" {...field} disabled={isCreating} />
                                     </FormControl>
                                     <FormMessage />
                                   </FormItem>
                                 )}
                               />
                               <FormField
                                 control={form.control}
                                 name="description"
                                 render={({ field }) => (
                                   <FormItem>
                                     <FormLabel>Description</FormLabel>
                                     <FormControl>
                                       <Textarea
                                         placeholder="Describe your project..."
                                         className="resize-none"
                                         {...field}
                                         disabled={isCreating}
                                       />
                                     </FormControl>
                                     <FormMessage />
                                   </FormItem>
                                 )}
                               />
                               <div className="space-y-3">
                                 <FormLabel>Objectives (at least 3)</FormLabel>
                                 {form.watch('objectives').map((_, index) => (
                                   <FormField
                                     key={index}
                                     control={form.control}
                                     name={`objectives.${index}`}
                                     render={({ field }) => (
                                       <FormItem>
                                         <FormControl>
                                           <Input
                                             placeholder={`Objective ${index + 1}`}
                                             {...field}
                                             disabled={isCreating}
                                           />
                                         </FormControl>
                                         <FormMessage />
                                       </FormItem>
                                     )}
                                   />
                                 ))}
                                 <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     const currentObjectives = form.getValues('objectives');
                                     form.setValue('objectives', [...currentObjectives, '']);
                                   }}
                                   disabled={isCreating}
                                 >
                                   <Plus className="h-4 w-4 mr-2" />
                                   Add Objective
                                 </Button>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                 <FormField
                                   control={form.control}
                                   name="methodology"
                                   render={({ field }) => (
                                     <FormItem>
                                       <FormLabel>Methodology</FormLabel>
                                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
                                         <FormControl>
                                           <SelectTrigger>
                                             <SelectValue placeholder="Select methodology" />
                                           </SelectTrigger>
                                         </FormControl>
                                         <SelectContent>
                                           <SelectItem value="SCRUM">Scrum</SelectItem>
                                           <SelectItem value="KANBAN">Kanban</SelectItem>
                                         </SelectContent>
                                       </Select>
                                       <FormMessage />
                                     </FormItem>
                                   )}
                                 />
                                 <FormField
                                   control={form.control}
                                   name="sprint_duration"
                                   render={({ field }) => (
                                     <FormItem>
                                       <FormLabel>Sprint Duration (weeks)</FormLabel>
                                       <Select
                                         onValueChange={(value) => field.onChange(parseInt(value))}
                                         defaultValue={field.value.toString()}
                                         disabled={isCreating}
                                       >
                                         <FormControl>
                                           <SelectTrigger>
                                             <SelectValue placeholder="Select duration" />
                                           </SelectTrigger>
                                         </FormControl>
                                         <SelectContent>
                                           <SelectItem value="1">1 week</SelectItem>
                                           <SelectItem value="2">2 weeks</SelectItem>
                                           <SelectItem value="3">3 weeks</SelectItem>
                                           <SelectItem value="4">4 weeks</SelectItem>
                                         </SelectContent>
                                       </Select>
                                       <FormMessage />
                                     </FormItem>
                                   )}
                                 />
                               </div>
                               <FormField
                                 control={form.control}
                                 name="start_date"
                                 render={({ field }) => (
                                   <FormItem>
                                     <FormLabel>Start Date</FormLabel>
                                     <FormControl>
                                       <Input type="date" {...field} disabled={isCreating} />
                                     </FormControl>
                                     <FormMessage />
                                   </FormItem>
                                 )}
                               />
                               <div className="flex gap-2 justify-end">
                                 <Button
                                   type="button"
                                   variant="outline"
                                   onClick={() => {
                                     setIsDialogOpen(false);
                                     setEditingProject(null);
                                     form.reset();
                                   }}
                                   disabled={isCreating}
                                 >
                                   Cancel
                                 </Button>
                                 <Button type="submit" disabled={isCreating}>
                                   {isCreating ? (
                                     <>
                                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                       {editingProject ? 'Updating...' : 'Creating...'}
                                     </>
                                   ) : (
                                     editingProject ? 'Update Project' : 'Create Project'
                                   )}
                                 </Button>
                               </div>
                             </form>
                           </Form>
                         </DialogContent>
                      </Dialog>
                    )}
                  </div>      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!loading && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 items-center">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Status</SelectItem>
                   <SelectItem value="PLANNING">Planning</SelectItem>
                   <SelectItem value="ACTIVE">Active</SelectItem>
                   <SelectItem value="COMPLETED">Completed</SelectItem>
                   <SelectItem value="ARCHIVED">Archived</SelectItem>
                 </SelectContent>
              </Select>

              <div className="flex border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>{searchQuery || statusFilter !== 'all' ? 'No matching projects' : 'No projects yet'}</CardTitle>
            <CardDescription>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'}
            </CardDescription>
          </CardHeader>
           
        </Card>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onArchive={setArchivingProject}
                onDelete={setDeletingProject}
              />
            ))}
        </div>
      )}

       <AlertDialog open={!!archivingProject} onOpenChange={() => setArchivingProject(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Archive Project</AlertDialogTitle>
             <AlertDialogDescription>
               Are you sure you want to archive "{archivingProject?.name}"? The project will be marked as completed and moved to archived status.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleArchive}>
               Archive
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Delete Project</AlertDialogTitle>
             <AlertDialogDescription>
               Are you sure you want to delete "{deletingProject?.name}"? This action cannot be undone and will permanently remove all project data.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
