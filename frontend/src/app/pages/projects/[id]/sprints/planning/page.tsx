import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { sprintsService } from "@/features/sprints/sprints.service";
import { backlogService } from "@/features/backlog/backlog.service";
import { Sprint, BacklogItem } from "@/shared/types";
import { AlertTriangle, Plus, Target, CheckCircle, ArrowLeft, Users } from "lucide-react";

export default function SprintPlanningPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isPlanningOpen, setPlanningOpen] = useState(false);
    const [newSprintName, setNewSprintName] = useState("");
    const [newSprintObjective, setNewSprintObjective] = useState("");
    const [plannedVelocity, setPlannedVelocity] = useState(0);

    const fetchData = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            // Get backlog items
            const items = await backlogService.getByProject(projectId);
            const backlogOnly = items.filter(item => !item.sprint_id);
            setBacklogItems(backlogOnly);

            // Get planning sprints
            const sprints = await sprintsService.getByProject(projectId);
            const planningSprint = sprints.find(s => s.status === 'PLANNING');
            setSelectedSprint(planningSprint || null);
        } catch (error) {
            toast({ title: "Error loading data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const handleItemToggle = (itemId: string, checked: boolean) => {
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(itemId);
        } else {
            newSelected.delete(itemId);
        }
        setSelectedItems(newSelected);
    };

    const selectedItemsList = backlogItems.filter(item => selectedItems.has(item.id));
    const totalSelectedPoints = selectedItemsList.reduce((sum, item) => sum + (item.story_points || 0), 0);
    const capacity = selectedSprint?.planned_velocity || plannedVelocity;
    const isOverCapacity = capacity > 0 && totalSelectedPoints > capacity;
    const capacityUsage = capacity > 0 ? (totalSelectedPoints / capacity) * 100 : 0;

    const handleCreateSprint = async () => {
        if (!projectId || !newSprintName) {
            toast({ title: "Please provide a sprint name", variant: "destructive" });
            return;
        }

        try {
            const sprint = await sprintsService.create({
                project_id: projectId,
                name: newSprintName,
                objective: newSprintObjective,
                planned_velocity: plannedVelocity,
            });

            toast({ title: "Sprint created successfully!" });
            setPlanningOpen(false);
            setNewSprintName("");
            setNewSprintObjective("");
            setPlannedVelocity(0);
            setSelectedSprint(sprint);
            fetchData(); // Refresh data
        } catch (error) {
            toast({ title: "Failed to create sprint", variant: "destructive" });
        }
    };

    const handleCommitToSprint = async () => {
        if (!selectedSprint) return;

        try {
            const promises = Array.from(selectedItems).map(itemId =>
                sprintsService.moveItemToSprint(selectedSprint.id, { itemId })
            );

            await Promise.all(promises);

            toast({
                title: "Items committed to sprint!",
                description: `${selectedItems.size} items moved to ${selectedSprint.name}`
            });

            // Navigate to active sprint
            navigate(`/projects/${projectId}/sprints/active`);
        } catch (error: any) {
            toast({
                title: "Failed to commit items",
                description: error.response?.data?.message || "An error occurred",
                variant: "destructive"
            });
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return <Badge variant="destructive">Critical</Badge>;
            case 'HIGH': return <Badge className="bg-orange-500">High</Badge>;
            case 'MEDIUM': return <Badge className="bg-yellow-500">Medium</Badge>;
            case 'LOW': return <Badge variant="secondary">Low</Badge>;
            default: return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        return <Badge variant="outline">{type.replace('_', ' ')}</Badge>;
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading sprint planning...</div>;

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to={`/projects/${projectId}/sprints`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Sprints
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Sprint Planning</h1>
                        <p className="text-gray-600">Select backlog items for the next sprint</p>
                    </div>
                </div>
            </div>

            {/* Sprint Selection */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <Target className="mr-2 h-5 w-5" />
                            Sprint Details
                        </span>
                        {!selectedSprint && (
                            <Dialog open={isPlanningOpen} onOpenChange={setPlanningOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Sprint
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Sprint</DialogTitle>
                                        <DialogDescription>
                                            Set up a new sprint for planning.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">Name</Label>
                                            <Input
                                                id="name"
                                                value={newSprintName}
                                                onChange={(e) => setNewSprintName(e.target.value)}
                                                className="col-span-3"
                                                placeholder="Sprint 1 - Authentication"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="objective" className="text-right">Objective</Label>
                                            <Input
                                                id="objective"
                                                value={newSprintObjective}
                                                onChange={(e) => setNewSprintObjective(e.target.value)}
                                                className="col-span-3"
                                                placeholder="Deliver user authentication system"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="velocity" className="text-right">Capacity</Label>
                                            <Input
                                                id="velocity"
                                                type="number"
                                                value={plannedVelocity}
                                                onChange={(e) => setPlannedVelocity(parseInt(e.target.value) || 0)}
                                                className="col-span-3"
                                                placeholder="20"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setPlanningOpen(false)}>Cancel</Button>
                                        <Button onClick={handleCreateSprint}>Create Sprint</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedSprint ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{selectedSprint.name}</h3>
                                {selectedSprint.objective && (
                                    <p className="text-gray-600">{selectedSprint.objective}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Capacity</p>
                                <p className="text-2xl font-bold">{selectedSprint.planned_velocity} pts</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No sprint available for planning. Create one to get started.</p>
                    )}
                </CardContent>
            </Card>

            {/* Capacity Overview */}
            {selectedSprint && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="mr-2 h-5 w-5" />
                            Capacity Planning
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Selected Items</Label>
                                <p className="text-2xl font-bold">{selectedItems.size}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Total Story Points</Label>
                                <p className="text-2xl font-bold">{totalSelectedPoints}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Capacity Usage</Label>
                                <p className={`text-2xl font-bold ${isOverCapacity ? 'text-red-600' : 'text-green-600'}`}>
                                    {capacityUsage.toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        {isOverCapacity && (
                            <Alert className="mt-4 border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    Warning: Selected items exceed sprint capacity by {totalSelectedPoints - capacity} points.
                                    Consider reducing scope or increasing capacity.
                                </AlertDescription>
                            </Alert>
                        )}

                        {selectedItems.size > 0 && !isOverCapacity && (
                            <Alert className="mt-4 border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    Good! Selected items fit within sprint capacity.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Backlog Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Backlog Items ({backlogItems.length})</CardTitle>
                        <CardDescription>
                            Select items to include in the sprint
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {backlogItems.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                    <Checkbox
                                        id={item.id}
                                        checked={selectedItems.has(item.id)}
                                        onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)}
                                        disabled={!selectedSprint}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Label htmlFor={item.id} className="font-medium cursor-pointer">
                                                {item.title}
                                            </Label>
                                            {getTypeBadge(item.type)}
                                            {getPriorityBadge(item.priority)}
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            {item.story_points && (
                                                <Badge variant="secondary">{item.story_points} pts</Badge>
                                            )}
                                            {item.tags && item.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {backlogItems.length === 0 && (
                                <p className="text-gray-500 text-center py-8">
                                    No backlog items available. Add items to the backlog first.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Selected for Sprint ({selectedItems.size})</CardTitle>
                        <CardDescription>
                            Items committed to this sprint
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {selectedItemsList.map((item) => (
                                <div key={item.id} className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{item.title}</span>
                                        {getTypeBadge(item.type)}
                                        {getPriorityBadge(item.priority)}
                                    </div>
                                    {item.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.story_points && (
                                            <Badge variant="secondary">{item.story_points} pts</Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleItemToggle(item.id, false)}
                                            className="ml-auto h-6 w-6 p-0"
                                        >
                                            <AlertTriangle className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {selectedItems.size === 0 && (
                                <p className="text-gray-500 text-center py-8">
                                    No items selected yet. Choose items from the backlog.
                                </p>
                            )}
                        </div>

                        {selectedSprint && selectedItems.size > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <Button
                                    onClick={handleCommitToSprint}
                                    className="w-full"
                                    disabled={isOverCapacity}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Commit to Sprint
                                </Button>
                                {isOverCapacity && (
                                    <p className="text-sm text-red-600 mt-2 text-center">
                                        Cannot commit: exceeds capacity
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}