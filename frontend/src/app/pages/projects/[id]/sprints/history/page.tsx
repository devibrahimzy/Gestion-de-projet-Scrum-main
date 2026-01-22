import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { sprintsService } from "@/features/sprints/sprints.service";
import VelocityChart from "@/features/sprints/VelocityChart";
import { SprintHistory, VelocityChartData } from "@/features/sprints/sprints.types";
import { ArrowLeft, History, TrendingUp, Target, CheckCircle } from "lucide-react";

export default function SprintHistoryPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [completedSprints, setCompletedSprints] = useState<SprintHistory[]>([]);
    const [velocityData, setVelocityData] = useState<VelocityChartData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        if (!projectId) return;
        try {
            setLoading(true);

            // Get completed sprints
            const sprints = await sprintsService.getByProject(projectId);
            const completed = sprints
                .filter(s => s.status === 'COMPLETED')
                .map(sprint => ({
                    id: sprint.id,
                    name: sprint.name,
                    objective: sprint.objective,
                    start_date: sprint.start_date,
                    end_date: sprint.end_date,
                    status: sprint.status,
                    planned_velocity: sprint.planned_velocity,
                    actual_velocity: sprint.actual_velocity,
                    completed_items: 0, // We'll need to calculate this
                    pending_items: 0
                }))
                .sort((a, b) => new Date(b.end_date || 0).getTime() - new Date(a.end_date || 0).getTime());

            setCompletedSprints(completed);

            // Get velocity chart data
            if (completed.length > 0) {
                const velocity = await sprintsService.getVelocityChart(projectId);
                setVelocityData(velocity);
            }
        } catch (error) {
            toast({ title: "Error loading sprint history", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [projectId]);

    if (loading) return <div className="flex justify-center items-center h-64">Loading sprint history...</div>;

    const totalSprints = completedSprints.length;
    const avgVelocity = totalSprints > 0
        ? completedSprints.reduce((sum, s) => sum + (s.actual_velocity || 0), 0) / totalSprints
        : 0;
    const totalStoryPoints = completedSprints.reduce((sum, s) => sum + (s.actual_velocity || 0), 0);

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
                        <h1 className="text-3xl font-bold flex items-center">
                            <History className="mr-2 h-8 w-8" />
                            Sprint History
                        </h1>
                        <p className="text-gray-600">Review completed sprints and team performance</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <Target className="h-8 w-8 text-blue-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Sprints</p>
                            <p className="text-2xl font-bold">{totalSprints}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <TrendingUp className="h-8 w-8 text-green-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Velocity</p>
                            <p className="text-2xl font-bold">{avgVelocity.toFixed(1)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <CheckCircle className="h-8 w-8 text-purple-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Points</p>
                            <p className="text-2xl font-bold">{totalStoryPoints}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <History className="h-8 w-8 text-orange-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Latest Sprint</p>
                            <p className="text-lg font-bold">
                                {completedSprints[0]?.name || 'None'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Velocity Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Velocity Trend</CardTitle>
                        <CardDescription>
                            Track velocity over time with moving average
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {velocityData ? (
                            <VelocityChart data={velocityData} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No velocity data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sprint Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sprint Performance Summary</CardTitle>
                        <CardDescription>
                            Overview of sprint outcomes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {completedSprints.slice(0, 5).map((sprint) => {
                                const efficiency = sprint.planned_velocity && sprint.actual_velocity
                                    ? (sprint.actual_velocity / sprint.planned_velocity) * 100
                                    : 0;

                                return (
                                    <div key={sprint.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium">{sprint.name}</h4>
                                            <Badge variant={efficiency >= 100 ? "default" : "secondary"}>
                                                {efficiency.toFixed(0)}%
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            {sprint.start_date && sprint.end_date && (
                                                <span>
                                                    {format(new Date(sprint.start_date), 'MMM dd')} - {format(new Date(sprint.end_date), 'MMM dd')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Planned: {sprint.planned_velocity || 0}</span>
                                            <span>Actual: {sprint.actual_velocity || 0}</span>
                                        </div>
                                        {sprint.objective && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {sprint.objective}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                            {completedSprints.length === 0 && (
                                <p className="text-gray-500 text-center py-8">
                                    No completed sprints yet.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Sprint History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Completed Sprints Details</CardTitle>
                    <CardDescription>
                        Detailed view of all completed sprints
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sprint</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Objective</TableHead>
                                <TableHead>Planned</TableHead>
                                <TableHead>Actual</TableHead>
                                <TableHead>Efficiency</TableHead>
                                <TableHead>Items</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedSprints.map((sprint) => {
                                const efficiency = sprint.planned_velocity && sprint.actual_velocity
                                    ? (sprint.actual_velocity / sprint.planned_velocity) * 100
                                    : 0;

                                return (
                                    <TableRow key={sprint.id}>
                                        <TableCell className="font-medium">{sprint.name}</TableCell>
                                        <TableCell>
                                            {sprint.start_date && sprint.end_date ? (
                                                <div className="text-sm">
                                                    <div>{format(new Date(sprint.start_date), 'MMM dd, yyyy')}</div>
                                                    <div className="text-gray-500">to {format(new Date(sprint.end_date), 'MMM dd, yyyy')}</div>
                                                </div>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {sprint.objective ? (
                                                <div className="max-w-xs truncate" title={sprint.objective}>
                                                    {sprint.objective}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No objective</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{sprint.planned_velocity || 0}</TableCell>
                                        <TableCell>{sprint.actual_velocity || 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={efficiency >= 100 ? "default" : efficiency >= 80 ? "secondary" : "destructive"}>
                                                {efficiency.toFixed(0)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{sprint.completed_items} completed</div>
                                                <div className="text-gray-500">{sprint.pending_items} pending</div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {completedSprints.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No completed sprints to display.</p>
                            <p className="text-sm">Complete your first sprint to see historical data here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}