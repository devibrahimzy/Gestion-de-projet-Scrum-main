import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BacklogItem } from '@/features/backlog/backlog.types';
import { backlogService } from '@/features/backlog/backlog.service';
import { projectsService } from '@/features/projects/projects.service';
import { sprintsService } from '@/features/sprints/sprints.service';
import { ProjectMemberWithUser } from '@/features/projects/projects.types';
import { Sprint } from '@/features/sprints/sprints.types';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const createBacklogItemSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['USER_STORY', 'BUG', 'TASK']),
  story_points: z.number().min(0).max(100).optional(),
  priority: z.number().min(1).max(5).optional(),
});

type CreateBacklogItemFormValues = z.infer<typeof createBacklogItemSchema>;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DONE':
      return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'TODO':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'BUG':
      return 'bg-red-100 text-red-800';
    case 'TASK':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export default function BacklogPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateBacklogItemFormValues>({
    resolver: zodResolver(createBacklogItemSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'USER_STORY',
      story_points: 0,
      priority: 3,
    },
  });

  const fetchAllData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [backlogData, membersData, sprintsData] = await Promise.all([
        backlogService.getByProject(projectId),
        projectsService.getMembers(projectId),
        sprintsService.getByProject(projectId),
      ]);
      setItems(backlogData);
      setMembers(membersData);
      setSprints(sprintsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backlog data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [projectId]);

  const onSubmit = async (values: CreateBacklogItemFormValues) => {
    if (!projectId) return;
    try {
      setIsCreating(true);
      setCreateError(null);

      await backlogService.create({
        project_id: projectId,
        title: values.title,
        description: values.description,
        type: values.type,
        story_points: values.story_points,
        priority: values.priority,
      });

      await fetchAllData();
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Item created successfully!" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await backlogService.delete(itemId);
      await fetchAllData();
      toast({ title: "Item deleted." });
    } catch (err) {
      toast({ title: "Error deleting item.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await backlogService.update(itemId, { status: newStatus });
      await fetchAllData();
      toast({ title: "Status updated." });
    } catch (err) {
      toast({ title: "Error updating status.", variant: "destructive" });
    }
  };

  const handleAssignMember = async (itemId: string, userId: string) => {
    try {
        await backlogService.assignMember(itemId, userId === 'unassigned' ? null : userId);
        await fetchAllData();
        toast({ title: "Assignee updated." });
    } catch(err) {
        toast({ title: "Error assigning member.", variant: "destructive" });
    }
  };

  const handleAssignSprint = async (itemId: string, sprintId: string) => {
    try {
        await backlogService.update(itemId, { sprint_id: sprintId === 'backlog' ? undefined : sprintId });
        await fetchAllData();
        toast({ title: "Sprint updated." });
    } catch(err) {
        toast({ title: "Error assigning sprint.", variant: "destructive" });
    }
  };
  
  const availableSprints = useMemo(() => {
    return sprints.filter(s => s.status === 'PLANNING' || s.status === 'ACTIVE');
  }, [sprints]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backlog</h1>
          <p className="text-muted-foreground mt-2">Manage project items and tasks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Backlog Item</DialogTitle>
            </DialogHeader>
            {createError && <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">{createError}</div>}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="e.g., Implement user authentication" disabled={isCreating} {...field}/></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the item..." disabled={isCreating} rows={3} {...field}/></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select value={field.value} onValueChange={field.onChange} disabled={isCreating}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USER_STORY">User Story</SelectItem><SelectItem value="BUG">Bug</SelectItem><SelectItem value="TASK">Task</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="story_points" render={({ field }) => (<FormItem><FormLabel>Story Points</FormLabel><FormControl><Input type="number" min="0" disabled={isCreating} {...field} onChange={(e) => field.onChange(Number(e.target.value))}/></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))} disabled={isCreating}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Critical</SelectItem><SelectItem value="2">High</SelectItem><SelectItem value="3">Medium</SelectItem><SelectItem value="4">Low</SelectItem><SelectItem value="5">Minimal</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isCreating} className="flex-1">{isCreating ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : ('Add Item')}</Button>
                  <Button type="button" variant="outline" disabled={isCreating} onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (<div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">{error}</div>)}
      {loading ? (<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>) 
      : items.length === 0 ? (
        <Card className="border-dashed"><CardHeader className="text-center"><CardTitle>No backlog items yet</CardTitle><CardDescription>Create your first backlog item to get started</CardDescription></CardHeader><CardContent className="flex justify-center">{/* Create form is duplicated here, can be componentized */}<Button onClick={() => setIsDialogOpen(true)}>Add First Item</Button></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                      <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                    </div>
                    {item.description && (<p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>)}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Select value={item.status} onValueChange={(value) => handleStatusChange(item.id, value)}><SelectTrigger className="w-auto h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BACKLOG">Backlog</SelectItem><SelectItem value="TODO">Todo</SelectItem><SelectItem value="IN_PROGRESS">In Progress</SelectItem><SelectItem value="DONE">Done</SelectItem></SelectContent></Select>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Assign Member:</span>
                        <Select value={item.assigned_to_id || 'unassigned'} onValueChange={(value) => handleAssignMember(item.id, value)}><SelectTrigger className="w-auto h-8"><SelectValue placeholder="Assignee"/></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{members.map(m => (<SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>))}</SelectContent></Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Select Sprint:</span>
                        <Select value={item.sprint_id || 'backlog'} onValueChange={(value) => handleAssignSprint(item.id, value)}><SelectTrigger className="w-auto h-8"><SelectValue placeholder="Sprint" /></SelectTrigger><SelectContent><SelectItem value="backlog">Backlog</SelectItem>{availableSprints.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select>
                      </div>
                      {item.story_points > 0 && (<span className="text-xs text-muted-foreground">{item.story_points} pts</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}