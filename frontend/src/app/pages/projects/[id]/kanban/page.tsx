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
import { BacklogItem } from "@/features/backlog/backlog.types";
import { Sprint } from "@/features/sprints/sprints.types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { commentsService } from "@/features/comments/comments.service";
import { Comment } from "@/features/comments/comments.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { formatDistanceToNow } from "date-fns";

type BacklogStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

const KANBAN_COLUMNS: BacklogStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'];

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
function KanbanCard({ item }: { item: BacklogItem }) {
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

    const assignee = item.assigned_to as any; // Assuming assigned_to comes with user details
    const assigneeName = assignee && assignee.first_name ? `${assignee.first_name} ${assignee.last_name}` : 'Unassigned';

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="mb-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Points: {item.story_points || 0}</span>
                     <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {assigneeName !== 'Unassigned' ? getInitials(assigneeName) : '?'}
                        </AvatarFallback>
                    </Avatar>
                </CardContent>
                <CardFooter className="p-2 pt-0 flex justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs gap-1">
                                <MessageCircle className="h-3 w-3" /> Comments
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{item.title}</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Discussion for this backlog item.
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
function KanbanColumn({ id, items, children }: { id: string; items: BacklogItem[], children: React.ReactNode }) {
    const { setNodeRef } = useSortable({ id, data: { type: 'column' } });

    return (
        <div ref={setNodeRef} className="w-72 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-bold mb-4 text-center">{id.replace('_', ' ')}</h3>
            <div className="space-y-4 min-h-[500px]">
                {children}
            </div>
        </div>
    );
}


export default function KanbanBoardPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
    const [boardItems, setBoardItems] = useState<BacklogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);

    const activeItem = useMemo(() => boardItems.find(item => item.id === activeId), [activeId, boardItems]);

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
                    const items = await kanbanService.getBoard(currentActiveSprint.id);
                    setBoardItems(items);
                }
            } catch (error) {
                toast({ title: "Error loading board", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        initializeBoard();
    }, [projectId, toast]);

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

        if (!over || active.id === over.id) return;

        const activeItem = boardItems.find(i => i.id === active.id);
        if (!activeItem) return;

        const overId = over.id as string;
        const overContainer = over.data.current?.type === 'column' ? over.id : over.data.current?.sortable.containerId;
        const toStatus = overContainer as BacklogStatus;
        
        const itemsInNewColumn = boardItems.filter(i => i.status === toStatus && i.id !== active.id);
        const newIndex = over.data.current?.type === 'item' 
            ? itemsInNewColumn.findIndex(i => i.id === overId)
            : itemsInNewColumn.length;
        
        const newPosition = newIndex >= 0 ? newIndex : itemsInNewColumn.length;

        // Optimistic update
        const updatedItems = boardItems.map(item =>
            item.id === active.id ? { ...item, status: toStatus, position: newPosition } : item
        );
        const sortedItems = updatedItems.sort((a, b) => (a.position || 0) - (b.position || 0));
        setBoardItems(sortedItems);

        try {
            await kanbanService.moveItem(active.id as string, { toStatus, toPosition: newPosition });
            toast({ title: "Task moved successfully!" });
            // Optionally re-fetch for consistency
            // const items = await kanbanService.getBoard(activeSprint!.id);
            // setBoardItems(items);
        } catch (error) {
            toast({ title: "Failed to move task", variant: "destructive" });
            // Revert optimistic update
            setBoardItems(boardItems);
        }
    };

    const columns = useMemo(() => {
        const grouped: Record<string, BacklogItem[]> = {};
        KANBAN_COLUMNS.forEach(col => {
            grouped[col] = [];
        });
        boardItems.forEach(item => {
            if (grouped[item.status]) {
                grouped[item.status].push(item);
            }
        });
        // Sort items within each column by position
        for (const col in grouped) {
            grouped[col].sort((a, b) => (a.position || 0) - (b.position || 0));
        }
        return grouped;
    }, [boardItems]);

    if (loading) return <div>Loading Kanban board...</div>;
    if (!activeSprint) return <div>No active sprint found for this project.</div>;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">Kanban Board: {activeSprint.name}</h1>
            <p className="text-muted-foreground mb-6">Drag and drop tasks to change their status.</p>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {KANBAN_COLUMNS.map((colId) => (
                        <KanbanColumn key={colId} id={colId} items={columns[colId]}>
                            {columns[colId].map((item) => (
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