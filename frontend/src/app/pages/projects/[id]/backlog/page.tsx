import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BacklogItem,
  BacklogFilters,
  BacklogSort,
  AcceptanceCriteria,
  BacklogAttachment
} from '@/features/backlog/backlog.types';
import { backlogService } from '@/features/backlog/backlog.service';
import { useBacklogStore } from '@/features/backlog/backlog.store';
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
  FormDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Loader2,
  Plus,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Grid3x3,
  List,
  Target,
  Paperclip,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit,
  Copy,
  Archive
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const createBacklogItemSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['USER_STORY', 'BUG', 'TECHNICAL_TASK', 'IMPROVEMENT']),
  story_points: z.union([z.number().min(1).max(21), z.literal(null)]).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  tags: z.array(z.string()).optional(),
  assigned_to_id: z.string().optional(),
  due_date: z.string().optional(),
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
    case 'TECHNICAL_TASK':
      return 'bg-purple-100 text-purple-800';
    case 'IMPROVEMENT':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-500 text-white';
    case 'HIGH':
      return 'bg-orange-500 text-white';
    case 'MEDIUM':
      return 'bg-yellow-500 text-black';
    case 'LOW':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];

export default function BacklogPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Store state
  const {
    backlogItems,
    filters,
    sort,
    viewMode,
    loading,
    error,
    acceptanceCriteria,
    attachments,
    setBacklogItems,
    setFilters,
    setSort,
    setViewMode,
    setLoading,
    setError,
    updateBacklogItem,
    removeBacklogItem,
    reorderBacklogItems,
    setAcceptanceCriteria,
    setAttachments,
  } = useBacklogStore();

  // Local state
  const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<CreateBacklogItemFormValues>({
    resolver: zodResolver(createBacklogItemSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'USER_STORY',
      priority: 'MEDIUM',
      tags: [],
      story_points: null,
    },
  });

  const fetchBacklogItems = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const backlogData = await backlogService.getByProject(projectId, filters, sort);
      setBacklogItems(backlogData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backlog data');
      console.error('Error fetching backlog data:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, sort, setBacklogItems, setLoading, setError]);

  const fetchAdditionalData = useCallback(async () => {
    if (!projectId) return;
    try {
      const [membersData, sprintsData] = await Promise.all([
        projectsService.getMembers(projectId),
        sprintsService.getByProject(projectId),
      ]);
      setMembers(membersData);
      setSprints(sprintsData);
    } catch (err) {
      console.error('Error fetching additional data:', err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAdditionalData();
  }, [fetchAdditionalData]);

  useEffect(() => {
    fetchBacklogItems();
  }, [fetchBacklogItems]);

  const onSubmit = async (values: CreateBacklogItemFormValues) => {
    if (!projectId) return;
    try {
      setIsCreating(true);
      setCreateError(null);

      const submitData = {
        project_id: projectId,
        title: values.title,
        description: values.description,
        type: values.type,
        story_points: values.story_points || null,
        priority: values.priority,
        tags: values.tags,
        assigned_to_id: values.assigned_to_id || null,
        due_date: values.due_date || undefined,
      };

      if (editingItem) {
        await backlogService.update(editingItem.id, submitData);
        toast({ title: "Item updated successfully!" });
      } else {
        await backlogService.create(submitData);
        toast({ title: "Item created successfully!" });
      }

      await fetchBacklogItems();
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save item';
      setCreateError(errorMessage);
      console.error('Error saving item:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Filtering and Sorting
  const handleFilterChange = (newFilters: Partial<BacklogFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSortChange = (newSort: BacklogSort) => {
    setSort(newSort);
  };

  const handleViewModeChange = (mode: 'list' | 'kanban' | 'board') => {
    setViewMode(mode);
  };

  // CRUD Operations
  const handleEdit = (item: BacklogItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description || '',
      type: item.type,
      story_points: item.story_points,
      priority: item.priority,
      tags: item.tags || [],
      assigned_to_id: item.assigned_to_id || '',
      due_date: item.due_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      await backlogService.delete(itemId);
      removeBacklogItem(itemId);
      toast({ title: "Item deleted successfully." });
    } catch (err) {
      toast({ title: "Error deleting item.", variant: "destructive" });
    }
  };

  const handleDuplicate = async (item: BacklogItem) => {
    try {
      await backlogService.create({
        project_id: item.project_id,
        title: `${item.title} (Copy)`,
        description: item.description,
        type: item.type,
        story_points: item.story_points,
        priority: item.priority,
        tags: item.tags,
      });
      await fetchBacklogItems();
      toast({ title: "Item duplicated successfully!" });
    } catch (err) {
      toast({ title: "Error duplicating item.", variant: "destructive" });
    }
  };

  // Status and Assignment Updates
  const handleStatusChange = async (itemId: string, newStatus: BacklogItem['status']) => {
    try {
      await backlogService.update(itemId, { status: newStatus });
      updateBacklogItem(itemId, { status: newStatus });
      toast({ title: "Status updated." });
    } catch (err) {
      toast({ title: "Error updating status.", variant: "destructive" });
    }
  };

  const handlePriorityChange = async (itemId: string, newPriority: BacklogItem['priority']) => {
    try {
      await backlogService.update(itemId, { priority: newPriority });
      updateBacklogItem(itemId, { priority: newPriority });
      toast({ title: "Priority updated." });
    } catch (err) {
      toast({ title: "Error updating priority.", variant: "destructive" });
    }
  };

  const handleAssignMember = async (itemId: string, userId: string) => {
    try {
      await backlogService.assignMember(itemId, userId === 'unassigned' ? null : userId);
      updateBacklogItem(itemId, { assigned_to_id: userId === 'unassigned' ? null : userId });
      toast({ title: "Assignee updated." });
    } catch(err) {
      toast({ title: "Error assigning member.", variant: "destructive" });
    }
  };

  const handleAssignSprint = async (itemId: string, sprintId: string) => {
    try {
      await backlogService.update(itemId, { sprint_id: sprintId === 'backlog' ? null : sprintId });
      updateBacklogItem(itemId, { sprint_id: sprintId === 'backlog' ? null : sprintId });
      toast({ title: "Sprint updated." });
    } catch(err) {
      toast({ title: "Error assigning sprint.", variant: "destructive" });
    }
  };

  // Drag and Drop
  const handleDragEnd = async (result: { destination?: { index: number }; source: { index: number } }) => {
    if (!result.destination || !projectId) return;

    // If filters are active, only allow reordering within the same filtered set
    const hasActiveFilters = searchQuery ||
      filters.type?.length ||
      filters.priority?.length ||
      filters.tags?.length ||
      filters.assigned_to_id ||
      filters.sprint_id ||
      filters.status?.length;

    if (hasActiveFilters) {
      toast({
        title: "Cannot reorder while filters are active",
        description: "Please clear all filters before reordering items.",
        variant: "destructive"
      });
      return;
    }

    const items = Array.from(filteredItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for optimistic UI
    setBacklogItems(items);

    try {
      await backlogService.reorder(projectId!, items.map(item => item.id));
      toast({ title: "Backlog reordered successfully." });
    } catch (err) {
      console.error('Reorder error:', err);
      // Revert on error
      await fetchBacklogItems();
      toast({ title: "Error reordering backlog.", variant: "destructive" });
    }
  };

  // Acceptance Criteria
  const loadAcceptanceCriteria = async (itemId: string) => {
    try {
      const criteria = await backlogService.getAcceptanceCriteria(itemId);
      setAcceptanceCriteria(itemId, criteria);
    } catch (err) {
      console.error('Error loading acceptance criteria:', err);
    }
  };

  const handleAddAcceptanceCriteria = async (itemId: string, description: string) => {
    try {
      const criteria = await backlogService.addAcceptanceCriteria(itemId, description);
      // Update local state
      const currentCriteria = acceptanceCriteria[itemId] || [];
      setAcceptanceCriteria(itemId, [...currentCriteria, criteria]);
      toast({ title: "Acceptance criteria added." });
    } catch (err) {
      toast({ title: "Error adding acceptance criteria.", variant: "destructive" });
    }
  };

  // Filtering
  const filteredItems = useMemo(() => {
    let filtered = backlogItems;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [backlogItems, searchQuery]);

  const availableSprints = useMemo(() => {
    return sprints.filter(s => s.status === 'PLANNING' || s.status === 'ACTIVE');
  }, [sprints]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backlog</h1>
            <p className="text-muted-foreground mt-2">Manage project items and tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex border rounded-md p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('kanban')}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingItem(null);
            }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Backlog Item' : 'Create New Backlog Item'}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Update the item details below.' : 'Fill in the details to create a new backlog item.'}
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
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., As a user, I want to authenticate securely"
                              disabled={isCreating}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>10-200 characters</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide detailed description of the item..."
                              disabled={isCreating}
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => field.onChange(value as CreateBacklogItemFormValues['type'])}
                              disabled={isCreating}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USER_STORY">User Story</SelectItem>
                                <SelectItem value="BUG">Bug</SelectItem>
                                <SelectItem value="TECHNICAL_TASK">Technical Task</SelectItem>
                                <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority *</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => field.onChange(value as CreateBacklogItemFormValues['priority'])}
                              disabled={isCreating}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                                <SelectItem value="HIGH">🟠 High</SelectItem>
                                <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                                <SelectItem value="LOW">🟢 Low</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="story_points"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Story Points</FormLabel>
                            <Select
                              value={field.value?.toString() || 'none'}
                              onValueChange={(value: string) => field.onChange(value === 'none' ? null : Number(value))}
                              disabled={isCreating}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select points" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Not estimated</SelectItem>
                                {fibonacciNumbers.map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Fibonacci scale (1, 2, 3, 5, 8, 13, 21)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                disabled={isCreating}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="assigned_to_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignee</FormLabel>
                            <Select value={field.value || 'unassigned'} onValueChange={(value: string) => field.onChange(value === 'unassigned' ? undefined : value)} disabled={isCreating}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {members.map(member => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.first_name} {member.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter tags separated by commas"
                              disabled={isCreating}
                              value={field.value?.join(', ') || ''}
                              onChange={(e) => {
                                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                field.onChange(tags);
                              }}
                            />
                          </FormControl>
                          <FormDescription>Separate tags with commas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={isCreating} className="flex-1">
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingItem ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          editingItem ? 'Update Item' : 'Create Item'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isCreating}
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingItem(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search titles, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={filters.type?.[0] || 'all'}
                    onValueChange={(value: string) => handleFilterChange({
                      type: value === 'all' ? undefined : [value as BacklogItem['type']]
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="USER_STORY">User Story</SelectItem>
                      <SelectItem value="BUG">Bug</SelectItem>
                      <SelectItem value="TECHNICAL_TASK">Technical Task</SelectItem>
                      <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={filters.priority?.[0] || 'all'}
                    onValueChange={(value: string) => handleFilterChange({
                      priority: value === 'all' ? undefined : [value as BacklogItem['priority']]
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Assignee</label>
                  <Select
                    value={filters.assigned_to_id || 'all'}
                    onValueChange={(value: string) => handleFilterChange({
                      assigned_to_id: value === 'all' ? undefined : value === 'unassigned' ? null : value
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All assignees</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sort by:</label>
                  <Select
                    value={`${sort.field}-${sort.direction}`}
                    onValueChange={(value: string) => {
                      const [field, direction] = value.split('-');
                      handleSortChange({ field: field as BacklogSort['field'], direction: direction as BacklogSort['direction'] });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="position-asc">Position ↑</SelectItem>
                      <SelectItem value="position-desc">Position ↓</SelectItem>
                      <SelectItem value="priority-asc">Priority ↑</SelectItem>
                      <SelectItem value="priority-desc">Priority ↓</SelectItem>
                      <SelectItem value="story_points-asc">Story Points ↑</SelectItem>
                      <SelectItem value="story_points-desc">Story Points ↓</SelectItem>
                      <SelectItem value="created_at-asc">Created ↑</SelectItem>
                      <SelectItem value="created_at-desc">Created ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                    setSort({ field: 'position', direction: 'asc' });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>
              {searchQuery || Object.keys(filters).length > 0 ? 'No items match your filters' : 'No backlog items yet'}
            </CardTitle>
            <CardDescription>
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Create your first backlog item to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setIsDialogOpen(true)}>
              {searchQuery || Object.keys(filters).length > 0 ? 'Clear Filters' : 'Add First Item'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="backlog">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {filteredItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`hover:shadow-md transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 cursor-grab active:cursor-grabbing"
                              >
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-muted-foreground font-mono">
                                    #{item.position}
                                  </span>
                                  <h3 className="font-semibold text-lg truncate flex-1">
                                    {item.title}
                                  </h3>
                                  <Badge className={getTypeColor(item.type)}>
                                    {item.type.replace('_', ' ')}
                                  </Badge>
                                  <Badge className={getPriorityColor(item.priority)}>
                                    {item.priority}
                                  </Badge>
                                  {item.is_blocked && (
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  )}
                                </div>

                                {item.description && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}

                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {item.tags.map((tag, tagIndex) => (
                                      <Badge key={tagIndex} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-4 flex-wrap text-sm">
                                  <Select
                                    value={item.status}
                                    onValueChange={(value: string) => handleStatusChange(item.id, value)}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="BACKLOG">📋 Backlog</SelectItem>
                                      <SelectItem value="TODO">📝 Todo</SelectItem>
                                      <SelectItem value="IN_PROGRESS">⚡ In Progress</SelectItem>
                                      <SelectItem value="DONE">✅ Done</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={item.priority}
                                    onValueChange={(value: string) => handlePriorityChange(item.id, value)}
                                  >
                                    <SelectTrigger className="w-24 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                                      <SelectItem value="HIGH">🟠 High</SelectItem>
                                      <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                                      <SelectItem value="LOW">🟢 Low</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={item.assigned_to_id || 'unassigned'}
                                    onValueChange={(value: string) => handleAssignMember(item.id, value)}
                                  >
                                    <SelectTrigger className="w-40 h-8">
                                      <SelectValue placeholder="👤 Assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">👤 Unassigned</SelectItem>
                                      {members.map(member => (
                                        <SelectItem key={member.id} value={member.id}>
                                          👤 {member.first_name} {member.last_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={item.sprint_id || 'backlog'}
                                    onValueChange={(value: string) => handleAssignSprint(item.id, value)}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue placeholder="🏃 Sprint" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="backlog">📋 Backlog</SelectItem>
                                      {availableSprints.map(sprint => (
                                        <SelectItem key={sprint.id} value={sprint.id}>
                                          🏃 {sprint.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  {item.story_points && (
                                    <span className="text-muted-foreground">
                                      🎯 {item.story_points} pts
                                    </span>
                                  )}

                                  {item.due_date && (
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(item.due_date).toLocaleDateString()}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Target className="h-3 w-3" />
                                    {acceptanceCriteria[item.id]?.length || 0}
                                  </div>

                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Paperclip className="h-3 w-3" />
                                    {attachments[item.id]?.length || 0}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}