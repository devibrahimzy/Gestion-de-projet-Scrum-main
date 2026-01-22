import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sprintsService } from "@/features/sprints/sprints.service";
import { ActiveSprintData, BurndownChartData, CompleteSprintDTO } from "@/features/sprints/sprints.types";
import BurndownChart from "@/features/sprints/BurndownChart";
import {
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    AlertTriangle,
    X,
    Eye,
    Target,
    Calendar,
    ArrowLeft
} from "lucide-react";

export default function ActiveSprintPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [activeSprintData, setActiveSprintData] = useState<ActiveSprintData | null>(null);
    const [burndownData, setBurndownData] = useState<BurndownChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCompleteOpen, setCompleteOpen] = useState(false);
    const [unfinishedAction, setUnfinishedAction] = useState<'backlog' | 'next_sprint'>('backlog');

    const fetchActiveSprint = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const data = await sprintsService.getActiveSprint(projectId);
            setActiveSprintData(data);

            // Fetch burndown data
            const burndown = await sprintsService.getBurndownChart(data.sprint.id);
            setBurndownData(burndown);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setActiveSprintData(null);
            } else {
                toast({ title: "Error loading active sprint", variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveSprint();
    }, [projectId]);

    const handleCompleteSprint = async () => {
        if (!activeSprintData) return;

        try {
            const result = await sprintsService.complete(activeSprintData.sprint.id, { unfinished_action: unfinishedAction });
            toast({
                title: "Sprint completed!",
                description: `Actual velocity: ${result.actual_velocity} points. ${result.unfinished_count} unfinished items moved to ${result.unfinished_handled === 'backlog' ? 'backlog' : 'next sprint'}.`
            });
            setCompleteOpen(false);
            // Redirect to sprints list
            window.location.href = `/projects/${projectId}/sprints`;
        } catch (error) {
            toast({ title: "Failed to complete sprint", variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'TODO': return <Badge variant="secondary">To Do</Badge>;
            case 'IN_PROGRESS': return <Badge variant="default">In Progress</Badge>;
            case 'DONE': return <Badge variant="outline" className="text-green-600 border-green-600">Done</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
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

    if (loading) return <div className="flex justify-center items-center h-64">Loading active sprint...</div>;

    if (!activeSprintData) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link to={`/projects/${projectId}/sprints`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Sprints
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Clock className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Sprint</h3>
                        <p className="text-gray-500 text-center mb-4">
                            There is currently no active sprint for this project.
                        </p>
                        <Link to={`/projects/${projectId}/sprints`}>
                            <Button>Go to Sprint Planning</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { sprint, items, capacity } = activeSprintData;
    const totalItems = items.length;
    const completedItems = items.filter(item => item.status === 'DONE').length;
    const inProgressItems = items.filter(item => item.status === 'IN_PROGRESS').length;

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
                        <h1 className="text-3xl font-bold">{sprint.name}</h1>
                        {sprint.objective && (
                            <p className="text-gray-600 mt-1">{sprint.objective}</p>
                        )}
                    </div>
                </div>
                <Dialog open={isCompleteOpen} onOpenChange={setCompleteOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Sprint
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Complete Sprint</DialogTitle>
                            <DialogDescription>
                                This will mark the sprint as completed. What would you like to do with unfinished items?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Select value={unfinishedAction} onValueChange={(value: 'backlog' | 'next_sprint') => setUnfinishedAction(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="backlog">Move unfinished items back to backlog</SelectItem>
                                    <SelectItem value="next_sprint">Keep unfinished items for next sprint</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setCompleteOpen(false)}>Cancel</Button>
                            <Button onClick={handleCompleteSprint}>Complete Sprint</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Sprint Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <Target className="h-8 w-8 text-blue-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Capacity</p>
                            <p className="text-2xl font-bold">{capacity.total} pts</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold">{capacity.completed} pts</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <TrendingUp className="h-8 w-8 text-orange-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Progress</p>
                            <p className="text-2xl font-bold">{capacity.progress_percentage}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <Users className="h-8 w-8 text-purple-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Items</p>
                            <p className="text-2xl font-bold">{totalItems}</p>
                            <p className="text-xs text-gray-500">{completedItems} done, {inProgressItems} in progress</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Bar */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Sprint Progress</span>
                        <span className="text-sm text-gray-600">{capacity.completed}/{capacity.total} story points</span>
                    </div>
                    <Progress value={capacity.progress_percentage} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Start: {format(new Date(sprint.start_date!), 'PPP')}</span>
                        <span>End: {format(new Date(sprint.end_date!), 'PPP')}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Burndown Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5" />
                            Burndown Chart
                        </CardTitle>
                        <CardDescription>
                            Track progress against the ideal burndown line
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {burndownData ? (
                            <BurndownChart data={burndownData} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Loading burndown data...
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sprint Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Eye className="mr-2 h-5 w-5" />
                            Sprint Items ({items.length})
                        </CardTitle>
                        <CardDescription>
                            All tasks committed to this sprint
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.type.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                                            <TableCell>{item.story_points || 'N/A'}</TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}