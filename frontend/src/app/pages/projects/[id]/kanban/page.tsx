import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { sprintsService } from "@/features/sprints/sprints.service";
import { kanbanService } from "@/features/kanban/kanban.service";
import { useKanbanStore } from "@/features/kanban/kanban.store";
import { KanbanBoard, KanbanItem, KanbanColumn, KanbanFilters } from "@/features/kanban/kanban.types";
import { Sprint } from "@/features/sprints/sprints.types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  AlertTriangle,
  MessageCircle,
  Send,
  Trash2,
  Plus,
  Settings,
  Filter,
  X,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Timer,
  Users
} from "lucide-react";
import { commentsService } from "@/features/comments/comments.service";
import { Comment } from "@/features/comments/comments.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { formatDistanceToNow } from "date-fns";

// Priority badge colors
const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'CRITICAL': return 'bg-red-500';
        case 'HIGH': return 'bg-orange-500';
        case 'MEDIUM': return 'bg-yellow-500';
        case 'LOW': return 'bg-gray-500';
        default: return 'bg-gray-500';
    }
};

// Status colors
const getStatusColor = (status: string) => {
    switch (status) {
        case 'TODO': return 'bg-gray-200 text-gray-800';
        case 'IN_PROGRESS': return 'bg-blue-200 text-blue-800';
        case 'DONE': return 'bg-green-200 text-green-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};

// Helper to get initials for avatar
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

// Comment Section Component
interface CommentSectionProps {
    backlogItemId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ backlogItemId }) => {
    const { toast } = useToast();
    const { user } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const fetchComments = useCallback(async () => {
        setLoadingComments(true);
        try {
            const fetchedComments = await commentsService.getByItem(backlogItemId);
            setComments(fetchedComments);
        } catch (error) {
            toast({ title: "Error fetching comments", variant: "destructive" });
        } finally {
            setLoadingComments(false);
        }
    }, [backlogItemId, toast]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleAddComment = async () => {
        if (!newCommentText.trim()) {
            toast({ title: "Comment cannot be empty", variant: "destructive" });
            return;
        }
        try {
            await commentsService.add({ item_id: backlogItemId, content: newCommentText });
            setNewCommentText("");
            fetchComments();
            toast({ title: "Comment added!" });
        } catch (error) {
            toast({ title: "Failed to add comment", variant: "destructive" });
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await commentsService.delete(commentId);
            fetchComments();
            toast({ title: "Comment deleted." });
        } catch (error) {
            toast({ title: "Failed to delete comment", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            {loadingComments ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No comments yet.</p>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">
                                    {getInitials(`${comment.first_name || ''} ${comment.last_name || ''}`)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        {comment.first_name} {comment.last_name}
                                        <span className="text-xs text-muted-foreground ml-2">
                                            {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : ''}
                                        </span>
                                    </p>
                                    {user?.id === comment.user_id && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteComment(comment.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-center space-x-2 pt-2">
                <Textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={1}
                    className="flex-1"
                />
                <Button size="icon" onClick={handleAddComment} disabled={!newCommentText.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};


// Individual Draggable Card
function KanbanCard({ item }: { item: KanbanItem }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id, data: { type: 'item', item } });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const assigneeName = item.assigned_user
        ? `${item.assigned_user.first_name} ${item.assigned_user.last_name}`
        : 'Unassigned';

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className={`mb-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-shadow ${
                item.is_overdue ? 'ring-2 ring-red-500' : ''
            } ${item.is_blocked ? 'ring-2 ring-yellow-500' : ''}`}>
                <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-sm font-medium line-clamp-2">{item.title}</CardTitle>
                            <div className="text-xs text-gray-500 mt-1 font-mono">{item.unique_id}</div>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                            {item.is_overdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            {item.is_blocked && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getPriorityColor(item.priority)} text-white`}>
                                {item.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {item.type.replace('_', ' ')}
                            </Badge>
                        </div>
                        {item.story_points && (
                            <Badge variant="secondary" className="text-xs">
                                {item.story_points} pts
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={item.assigned_user?.profile_photo} />
                                <AvatarFallback className="text-xs">
                                    {assigneeName !== 'Unassigned' ? getInitials(assigneeName) : '?'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600 truncate max-w-20">
                                {assigneeName}
                            </span>
                        </div>

                        {item.comment_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MessageCircle className="h-3 w-3" />
                                {item.comment_count}
                            </div>
                        )}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {item.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-2 pt-0 flex justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {item.comment_count > 0 ? item.comment_count : ''}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{item.title}</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    {item.unique_id} • {item.type.replace('_', ' ')} • {item.priority} priority
                                </DialogDescription>
                            </DialogHeader>
                            <CommentSection backlogItemId={item.id} />
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>
    );
}

// Column Container
function KanbanColumn({ column, children }: { column: KanbanColumn; children: React.ReactNode }) {
    const { setNodeRef } = useSortable({ id: column.id || column.name, data: { type: 'column' } });

    const isWipExceeded = column.wip_limit && column.item_count > column.wip_limit;

    return (
        <div ref={setNodeRef} className={`w-72 flex-shrink-0 rounded-lg p-4 min-h-[600px] ${
            isWipExceeded
                ? 'bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800'
                : 'bg-gray-100 dark:bg-gray-900'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-center flex-1">{column.name}</h3>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                        isWipExceeded ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                        {column.item_count}
                        {column.wip_limit && `/${column.wip_limit}`}
                    </span>
                </div>
            </div>

            {column.warning && (
                <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    {column.warning}
                </div>
            )}

            <div className="space-y-4 min-h-[500px]">
                {children}
            </div>
        </div>
    );
}


export default function KanbanBoardPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const { toast } = useToast();

    const {
        board,
        filters,
        loading,
        error,
        setBoard,
        setFilters,
        moveItemLocally,
        updateItem,
        setLoading,
        setError
    } = useKanbanStore();

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");
    const [newColumnWipLimit, setNewColumnWipLimit] = useState<number>(0);

    const activeItem = useMemo(() =>
        board?.columns.flatMap(col => col.items).find(item => item.id === activeId) || null,
        [activeId, board]
    );

    useEffect(() => {
        const initializeBoard = async () => {
            if (!projectId) return;
            try {
                setLoading(true);
                const projectSprints = await sprintsService.getByProject(projectId);
                setSprints(projectSprints);

                const currentActiveSprint = projectSprints.find(s => s.status === 'ACTIVE') || null;
                setActiveSprint(currentActiveSprint);

                if (currentActiveSprint) {
                    const boardData = await kanbanService.getBoard(currentActiveSprint.id, filters);
                    setBoard(boardData);
                }
            } catch (error) {
                setError("Error loading board");
                toast({ title: "Error loading board", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        initializeBoard();
    }, [projectId, filters, toast, setBoard, setLoading, setError]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id || !board) return;

        const activeItem = board.columns.flatMap(col => col.items).find(i => i.id === active.id);
        if (!activeItem) return;

        const overId = over.id as string;
        const overContainer = over.data.current?.type === 'column' ? over.id : over.data.current?.sortable.containerId;
        const toStatus = overContainer as string;

        // Find target column
        const targetColumn = board.columns.find(col =>
            col.id === overContainer || col.name === overContainer ||
            (col.status && col.status === toStatus) ||
            (col.name && col.name.replace(/\s+/g, '_').toUpperCase() === toStatus)
        );

        if (!targetColumn) return;

        const itemsInNewColumn = targetColumn.items.filter(i => i.id !== active.id);
        const newIndex = over.data.current?.type === 'item'
            ? itemsInNewColumn.findIndex(i => i.id === overId) + 1
            : itemsInNewColumn.length;

        const newPosition = Math.max(0, newIndex);

        // Optimistic update
        moveItemLocally(active.id as string, targetColumn.status || toStatus, newPosition);

        try {
            await kanbanService.moveItem(active.id as string, {
                toStatus: targetColumn.status || toStatus,
                toPosition: newPosition
            });
            toast({ title: "Task moved successfully!" });

            // Refresh board data
            if (activeSprint) {
                const boardData = await kanbanService.getBoard(activeSprint.id, filters);
                setBoard(boardData);
            }
        } catch (error) {
            toast({ title: "Failed to move task", variant: "destructive" });
            // Revert will happen automatically when we refresh
            if (activeSprint) {
                const boardData = await kanbanService.getBoard(activeSprint.id, filters);
                setBoard(boardData);
            }
        }
    };

    const handleFilterChange = (newFilters: Partial<KanbanFilters>) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) {
            toast({ title: "Column name is required", variant: "destructive" });
            return;
        }

        try {
            await kanbanService.createColumn(projectId!, {
                name: newColumnName,
                wip_limit: newColumnWipLimit > 0 ? newColumnWipLimit : undefined
            });
            toast({ title: "Column added successfully!" });
            setNewColumnName("");
            setNewColumnWipLimit(0);
            setIsColumnDialogOpen(false);

            // Refresh board
            if (activeSprint) {
                const boardData = await kanbanService.getBoard(activeSprint.id, filters);
                setBoard(boardData);
            }
        } catch (error) {
            toast({ title: "Failed to add column", variant: "destructive" });
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading Kanban board...</div>;
    if (!activeSprint) return (
        <div className="container mx-auto py-8">
            <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Active Sprint</h2>
                <p className="text-gray-500">Please activate a sprint to view the Kanban board.</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Kanban Board</h1>
                    <p className="text-muted-foreground">Sprint: {activeSprint.name}</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {Object.keys(filters).length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {Object.keys(filters).length}
                            </Badge>
                        )}
                    </Button>

                    <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Column
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Column</DialogTitle>
                                <DialogDescription>
                                    Create a custom column for your Kanban board.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="column-name" className="text-right">Name</Label>
                                    <Input
                                        id="column-name"
                                        value={newColumnName}
                                        onChange={(e) => setNewColumnName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="e.g., Review, Testing"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="wip-limit" className="text-right">WIP Limit</Label>
                                    <Input
                                        id="wip-limit"
                                        type="number"
                                        value={newColumnWipLimit || ""}
                                        onChange={(e) => setNewColumnWipLimit(parseInt(e.target.value) || 0)}
                                        className="col-span-3"
                                        placeholder="Leave empty for no limit"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsColumnDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddColumn}>Add Column</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <Filter className="h-5 w-5 mr-2" />
                                Filters
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                disabled={Object.keys(filters).length === 0}
                            >
                                Clear All
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Assignee</Label>
                                <Select
                                    value={filters.assigned_to_id || ""}
                                    onValueChange={(value) =>
                                        handleFilterChange({ assigned_to_id: value || undefined })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All assignees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All assignees</SelectItem>
                                        {/* TODO: Populate with actual team members */}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={filters.type || ""}
                                    onValueChange={(value) =>
                                        handleFilterChange({ type: value || undefined })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All types</SelectItem>
                                        <SelectItem value="USER_STORY">User Story</SelectItem>
                                        <SelectItem value="BUG">Bug</SelectItem>
                                        <SelectItem value="TECHNICAL_TASK">Technical Task</SelectItem>
                                        <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={filters.priority || ""}
                                    onValueChange={(value) =>
                                        handleFilterChange({ priority: value || undefined })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All priorities</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(false)}
                                    className="w-full"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Hide Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {board?.columns.map((column) => (
                        <KanbanColumn key={column.id || column.name} column={column}>
                            {column.items.map((item) => (
                                <KanbanCard key={item.id} item={item} />
                            ))}
                        </KanbanColumn>
                    ))}
                </div>
                <DragOverlay>
                    {activeItem ? <KanbanCard item={activeItem} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}