import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { retrospectivesService } from "@/features/retrospectives/retrospectives.service";
import { Retrospective, RetroTrendsData } from "@/features/retrospectives/retrospectives.types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import {
    History,
    TrendingUp,
    Calendar,
    Users,
    CheckCircle,
    Target,
    ArrowLeft,
    Eye,
    Download
} from "lucide-react";
import { format } from "date-fns";

export default function RetrospectiveHistoryPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
    const [trends, setTrends] = useState<RetroTrendsData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!projectId) return;
            try {
                setLoading(true);
                const [retroData, trendsData] = await Promise.all([
                    retrospectivesService.getByProject(projectId),
                    retrospectivesService.getTrends(projectId)
                ]);

                setRetrospectives(retroData);
                setTrends(trendsData);
            } catch (error) {
                toast({ title: "Error loading retrospective history", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [projectId, toast]);

    const handleExportPDF = async (retroId: string) => {
        try {
            const blob = await retrospectivesService.exportPDF(retroId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `retrospective-${retroId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "PDF exported successfully!" });
        } catch (error) {
            toast({ title: "Failed to export PDF", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading retrospective history...</div>;
    }

    const totalRetrospectives = retrospectives.length;
    const publishedRetrospectives = retrospectives.filter(r => r.status === 'PUBLISHED').length;
    const averageCompletionRate = trends.length > 0
        ? Math.round(trends.reduce((sum, t) => sum + t.completion_rate, 0) / trends.length)
        : 0;

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to={`/projects/${projectId}/sprints`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                        
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            <History className="mr-2 h-8 w-8" />
                            Retrospective History
                        </h1>
                        <p className="text-gray-600 mt-1">Review past retrospectives and team improvement trends</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <History className="h-8 w-8 text-blue-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Retrospectives</p>
                            <p className="text-2xl font-bold">{totalRetrospectives}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <Eye className="h-8 w-8 text-green-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Published</p>
                            <p className="text-2xl font-bold">{publishedRetrospectives}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <CheckCircle className="h-8 w-8 text-purple-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                            <p className="text-2xl font-bold">{averageCompletionRate}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <TrendingUp className="h-8 w-8 text-orange-500 mr-4" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Improvement Items</p>
                            <p className="text-2xl font-bold">
                                {trends.reduce((sum, t) => sum + t.improve_count, 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="history" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="history">Retrospective History</TabsTrigger>
                    <TabsTrigger value="trends">Improvement Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Retrospectives</CardTitle>
                            <CardDescription>
                                Complete history of team retrospectives with their associated sprints
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sprint</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Participants</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {retrospectives.map((retro) => {
                                        const itemCounts = retro.items?.reduce((acc, item) => {
                                            acc[item.category] = (acc[item.category] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>) || {};

                                        return (
                                            <TableRow key={retro.id}>
                                                <TableCell className="font-medium">
                                                    {retro.sprint_name || `Sprint ${retro.sprint_id}`}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(retro.date), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={retro.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                        {retro.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="text-green-600">
                                                            {itemCounts.POSITIVE || 0} ✓
                                                        </Badge>
                                                        <Badge variant="outline" className="text-yellow-600">
                                                            {itemCounts.IMPROVE || 0} ⚡
                                                        </Badge>
                                                        <Badge variant="outline" className="text-blue-600">
                                                            {itemCounts.ACTION || 0} 🎯
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-gray-500" />
                                                        <span>{retro.items?.length || 0} contributions</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link to={`/projects/${projectId}/sprints/${retro.sprint_id}/retrospective`}>
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                View
                                                            </Link>
                                                        </Button>
                                                        {retro.status === 'PUBLISHED' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleExportPDF(retro.id)}
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                PDF
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {retrospectives.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No retrospectives found</p>
                                    <p className="text-sm">Complete your first sprint retrospective to see it here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Trends Chart Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Retrospective Trends</CardTitle>
                                <CardDescription>
                                    How retrospective participation and focus areas have evolved
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {trends.slice(0, 5).map((trend, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{trend.sprint_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {format(new Date(trend.date), 'MMM yyyy')}
                                                </p>
                                            </div>
                                            <div className="flex gap-3 text-sm">
                                                <div className="text-center">
                                                    <p className="font-medium text-green-600">{trend.positive_count}</p>
                                                    <p className="text-gray-500">Positive</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-yellow-600">{trend.improve_count}</p>
                                                    <p className="text-gray-500">Improve</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-blue-600">{trend.action_count}</p>
                                                    <p className="text-gray-500">Actions</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {trends.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No trend data available</p>
                                            <p className="text-sm">Complete more retrospectives to see trends</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Items Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Action Items Overview</CardTitle>
                                <CardDescription>
                                    Summary of completed and pending action items from all retrospectives
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-600">
                                                {trends.reduce((sum, t) => sum + Math.round(t.completion_rate * t.action_count / 100), 0)}
                                            </p>
                                            <p className="text-sm text-gray-600">Completed</p>
                                        </div>
                                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                            <Target className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-yellow-600">
                                                {trends.reduce((sum, t) => sum + Math.round((100 - t.completion_rate) * t.action_count / 100), 0)}
                                            </p>
                                            <p className="text-sm text-gray-600">Pending</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium mb-3">Recent Action Items</h4>
                                        <div className="space-y-2">
                                            {/* This would show actual recent action items */}
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                Action items from completed retrospectives will appear here
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}