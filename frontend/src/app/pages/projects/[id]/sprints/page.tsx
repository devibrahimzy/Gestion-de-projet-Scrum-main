import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sprintsService } from "@/features/sprints/sprints.service";
import { Sprint, UpdateSprintDTO } from "@/features/sprints/sprints.types";
import { PlusCircle, MoreHorizontal, CalendarIcon, Play, CheckCircle, Trash2, Eye, GitBranch, Edit, Target, TrendingUp, History } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export default function SprintsPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

    // Form state for new sprint
    const [newName, setNewName] = useState("");
    const [newStartDate, setNewStartDate] = useState<Date | undefined>();
    const [newEndDate, setNewEndDate] = useState<Date | undefined>();
    const [newPlannedVelocity, setNewPlannedVelocity] = useState<number>(0);

    // Form state for editing sprint
    const [editName, setEditName] = useState("");
    const [editStartDate, setEditStartDate] = useState<Date | undefined>();
    const [editEndDate, setEditEndDate] = useState<Date | undefined>();
    const [editPlannedVelocity, setEditPlannedVelocity] = useState<number>(0);


    const fetchSprints = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const projectSprints = await sprintsService.getByProject(projectId);
            setSprints(projectSprints.sort((a,b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()));
        } catch (error) {
            toast({ title: "Error fetching sprints", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSprints();
    }, [projectId]);

    const handleCreateSprint = async () => {
        if (!projectId || !newName || !newStartDate || !newEndDate) {
            toast({ title: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        try {
            await sprintsService.create({
                project_id: projectId,
                name: newName,
                start_date: format(newStartDate, "yyyy-MM-dd"),
                end_date: format(newEndDate, "yyyy-MM-dd"),
                planned_velocity: newPlannedVelocity,
            });
            toast({ title: "Sprint created successfully!" });
            fetchSprints();
            setCreateOpen(false);
            // Reset form
            setNewName("");
            setNewStartDate(undefined);
            setNewEndDate(undefined);
            setNewPlannedVelocity(0);
        } catch (error) {
            toast({ title: "Failed to create sprint", variant: "destructive" });
        }
    };

    const handleActivateSprint = async (sprintId: string) => {
        try {
            await sprintsService.activate(sprintId);
            toast({ title: "Sprint activated!" });
            fetchSprints();
        } catch (error) {
            toast({ title: "Failed to activate sprint", variant: "destructive" });
        }
    };

    const handleCompleteSprint = async (sprintId: string) => {
        try {
            const result = await sprintsService.complete(sprintId);
            toast({ title: "Sprint completed!", description: `Actual velocity: ${result.actual_velocity}` });
            fetchSprints();
        } catch (error) {
            toast({ title: "Failed to complete sprint", variant: "destructive" });
        }
    };

    const handleUpdateSprint = async () => {
        if (!editingSprint) return;
        
        try {
            const updateData: UpdateSprintDTO = {
                name: editName,
                start_date: editStartDate ? format(editStartDate, "yyyy-MM-dd") : undefined,
                end_date: editEndDate ? format(editEndDate, "yyyy-MM-dd") : undefined,
                planned_velocity: editPlannedVelocity,
            };
            
            await sprintsService.update(editingSprint.id, updateData);
            toast({ title: "Sprint updated successfully!" });
            fetchSprints();
            setEditOpen(false);
            setEditingSprint(null);
            // Reset edit form
            setEditName("");
            setEditStartDate(undefined);
            setEditEndDate(undefined);
            setEditPlannedVelocity(0);
        } catch (error) {
            toast({ title: "Failed to update sprint", variant: "destructive" });
        }
    };

    const handleEditSprint = (sprint: Sprint) => {
        setEditingSprint(sprint);
        setEditName(sprint.name);
        setEditStartDate(sprint.start_date ? new Date(sprint.start_date) : undefined);
        setEditEndDate(sprint.end_date ? new Date(sprint.end_date) : undefined);
        setEditPlannedVelocity(sprint.planned_velocity || 0);
        setEditOpen(true);
    };

    const handleDeleteSprint = async (sprintId: string) => {
        if (!window.confirm("Are you sure you want to delete this sprint?")) return;
        try {
            await sprintsService.delete(sprintId);
            toast({ title: "Sprint deleted." });
            fetchSprints();
        } catch (error) {
            toast({ title: "Failed to delete sprint", variant: "destructive" });
        }
    };

    const getStatusBadge = (status: Sprint['status']) => {
        switch (status) {
            case 'PLANNING': return <span className="text-blue-500 bg-blue-100 px-2 py-1 rounded-full text-xs">{status}</span>;
            case 'ACTIVE': return <span className="text-green-500 bg-green-100 px-2 py-1 rounded-full text-xs">{status}</span>;
            case 'COMPLETED': return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">{status}</span>;
        }
    };

    if (loading) return <div>Loading sprints...</div>;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Sprints</h1>
                <div className="flex gap-2">
                    <Link to={`/projects/${projectId}/sprints/active`}>
                        <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            Active Sprint
                        </Button>
                    </Link>
                    <Link to={`/projects/${projectId}/sprints/planning`}>
                        <Button variant="outline">
                            <Target className="mr-2 h-4 w-4" />
                            Sprint Planning
                        </Button>
                    </Link>
                    <Link to={`/projects/${projectId}/sprints/history`}>
                        <Button variant="outline">
                            <History className="mr-2 h-4 w-4" />
                            History
                        </Button>
                    </Link>
                    <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Sprint
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a new sprint</DialogTitle>
                            <DialogDescription>Fill in the details for your new sprint.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="start-date" className="text-right">Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="col-span-3 justify-start font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newStartDate ? format(newStartDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={newStartDate} onSelect={setNewStartDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="end-date" className="text-right">End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="col-span-3 justify-start font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newEndDate ? format(newEndDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={newEndDate} onSelect={setNewEndDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="velocity" className="text-right">Planned Velocity</Label>
                                <Input id="velocity" type="number" value={newPlannedVelocity} onChange={(e) => setNewPlannedVelocity(parseInt(e.target.value, 10))} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateSprint}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
                </div>

                {/* Edit Sprint Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit sprint</DialogTitle>
                            <DialogDescription>Update the details for this sprint.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Name</Label>
                                <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-start-date" className="text-right">Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="col-span-3 justify-start font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editStartDate ? format(editStartDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={editStartDate} onSelect={setEditStartDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-end-date" className="text-right">End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="col-span-3 justify-start font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editEndDate ? format(editEndDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={editEndDate} onSelect={setEditEndDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-velocity" className="text-right">Planned Velocity</Label>
                                <Input id="edit-velocity" type="number" value={editPlannedVelocity} onChange={(e) => setEditPlannedVelocity(parseInt(e.target.value, 10))} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateSprint}>Update Sprint</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Velocity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sprints.map((sprint) => {
                            const progressPercentage = sprint.status === 'COMPLETED' && sprint.planned_velocity
                                ? Math.min((sprint.actual_velocity || 0) / sprint.planned_velocity * 100, 100)
                                : 0;

                            return (
                                <TableRow key={sprint.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <div>{sprint.name}</div>
                                            {sprint.objective && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {sprint.objective}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(sprint.status)}</TableCell>
                                    <TableCell>
                                        {sprint.status === 'COMPLETED' ? (
                                            <div className="flex items-center gap-2">
                                                <Progress value={progressPercentage} className="w-16 h-2" />
                                                <span className="text-xs">{progressPercentage.toFixed(0)}%</span>
                                            </div>
                                        ) : sprint.status === 'ACTIVE' ? (
                                            <span className="text-blue-600 cursor-pointer" onClick={() => window.location.href = `/projects/${projectId}/sprints/active`}>
                                                <TrendingUp className="h-4 w-4 inline mr-1" />
                                                View Progress
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Not started</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{sprint.start_date ? format(new Date(sprint.start_date), 'MMM dd') : 'N/A'}</TableCell>
                                    <TableCell>{sprint.end_date ? format(new Date(sprint.end_date), 'MMM dd') : 'N/A'}</TableCell>
                                    <TableCell>{sprint.planned_velocity || 'N/A'}</TableCell>
                                    <TableCell>{sprint.actual_velocity ?? 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {sprint.status === 'PLANNING' && (
                                                    <DropdownMenuItem onClick={() => handleEditSprint(sprint)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {sprint.status === 'COMPLETED' && (
                                                     <DropdownMenuItem asChild>
                                                        <Link to={`/projects/${projectId}/sprints/${sprint.id}/retrospective`}>
                                                            <GitBranch className="mr-2 h-4 w-4" /> Retrospective
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {sprint.status === 'PLANNING' && (
                                                    <DropdownMenuItem onClick={() => handleActivateSprint(sprint.id)}>
                                                        <Play className="mr-2 h-4 w-4" /> Activate
                                                    </DropdownMenuItem>
                                                )}
                                                {sprint.status === 'ACTIVE' && (
                                                    <DropdownMenuItem onClick={() => handleCompleteSprint(sprint.id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Complete
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSprint(sprint.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}