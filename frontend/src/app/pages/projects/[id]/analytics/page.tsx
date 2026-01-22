import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardService } from '@/features/dashboard/dashboard.service';
import { retrospectivesService } from '@/features/retrospectives/retrospectives.service';
import { VelocityData, AgilePerformance, MemberWorkload, HealthIndicators } from '@/features/dashboard/dashboard.types';
import { Retrospective } from '@/features/retrospectives/retrospectives.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AlertCircle, TrendingUp, BarChart3, Zap, Target, GitPullRequest, Calendar, MessageSquare, CheckCircle2, AlertTriangle, Lightbulb, Users, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { WorkloadChart } from '@/features/dashboard/Charts';

interface TrendData {
  mostCommonItems: Array<{
    content: string;
    type: 'WELL' | 'BAD' | 'ACTION';
    count: number;
  }>;
  sentimentTrend: Array<{
    period: string;
    positive: number;
    negative: number;
    actions: number;
  }>;
  topActionItems: Array<{
    content: string;
    votes: number;
    status: 'PENDING' | 'RESOLVED';
  }>;
}

export default function AnalyticsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  
  const [velocity, setVelocity] = useState<VelocityData[]>([]);
  const [performance, setPerformance] = useState<AgilePerformance | null>(null);
  const [workload, setWorkload] = useState<MemberWorkload[]>([]);
  const [healthIndicators, setHealthIndicators] = useState<HealthIndicators | null>(null);
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [velocityData, performanceData, workloadData, healthData, retrospectivesData, trendsData] = await Promise.all([
          dashboardService.getVelocity(projectId),
          dashboardService.getAgilePerformance(projectId),
          dashboardService.getWorkload(projectId),
          dashboardService.getHealthIndicators(projectId),
          retrospectivesService.getByProject(projectId),
          retrospectivesService.getTrends(projectId),
        ]);

        setVelocity(velocityData);
        setPerformance(performanceData);
        setWorkload(workloadData);
        setHealthIndicators(healthData);
        setRetrospectives(retrospectivesData);
        setTrends(trendsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive/80">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare velocity chart data
  const velocityChartData = velocity.map(sprint => ({
    name: sprint.sprintName,
    Planned: sprint.planned,
    Actual: sprint.actual,
  }));

  // Calculate velocity statistics
  const avgPlannedVelocity = velocity.length > 0 
    ? velocity.reduce((sum, sprint) => sum + sprint.planned, 0) / velocity.length 
    : 0;
  const avgActualVelocity = velocity.length > 0 
    ? velocity.reduce((sum, sprint) => sum + sprint.actual, 0) / velocity.length 
    : 0;
  const velocityAccuracy = avgPlannedVelocity > 0 
    ? (avgActualVelocity / avgPlannedVelocity) * 100 
    : 0;

  // Prepare retrospective data
  const retroItemCount = retrospectives.reduce((total, retro) => 
    total + (retro.items?.length || 0), 0
  );
  const retroItemTypes = retrospectives.reduce((acc, retro) => {
    retro.items?.forEach(item => {
      acc[item.type] = (acc[item.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const retroChartData = [
    { name: 'Went Well', value: retroItemTypes.WELL || 0, color: '#10b981' },
    { name: 'Need Improvement', value: retroItemTypes.BAD || 0, color: '#ef4444' },
    { name: 'Action Items', value: retroItemTypes.ACTION || 0, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Project Analytics</h1>
        <p className="text-muted-foreground">
          Long-term insights and performance trends for your project
        </p>
      </div>

      <Tabs defaultValue="velocity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="velocity" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Velocity
          </TabsTrigger>
          <TabsTrigger value="workload" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Workload
          </TabsTrigger>
          <TabsTrigger value="agile" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Agile Metrics
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health Indicators
          </TabsTrigger>
          <TabsTrigger value="retrospectives" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Retrospectives
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Velocity Tab */}
        <TabsContent value="velocity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Planned</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgPlannedVelocity.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Story points per sprint</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Actual</CardTitle>
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgActualVelocity.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Story points per sprint</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planning Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{velocityAccuracy.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Actual vs Planned</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Velocity Over Time
              </CardTitle>
              <CardDescription>Planned vs actual story points across sprints</CardDescription>
            </CardHeader>
            <CardContent>
              {velocity.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={velocityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Planned" fill="#3b82f6" name="Planned Story Points" />
                      <Bar dataKey="Actual" fill="#10b981" name="Actual Story Points" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No velocity data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Workload Tab */}
        <TabsContent value="workload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Workload Distribution
              </CardTitle>
              <CardDescription>Tasks and story points assigned to each team member</CardDescription>
            </CardHeader>
            <CardContent>
              {workload.length > 0 ? (
                <WorkloadChart data={workload} />
              ) : (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No workload data available
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workload.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{member.first_name} {member.last_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Assigned Tasks</div>
                      <div className="text-2xl font-bold">{member.assigned_tasks}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Completed</div>
                      <div className="text-2xl font-bold text-green-500">{member.completed_tasks}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">In Progress</div>
                      <div className="text-2xl font-bold text-blue-500">{member.in_progress_tasks}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Story Points</div>
                      <div className="text-2xl font-bold">{member.total_story_points}</div>
                    </div>
                  </div>
                  {member.total_story_points > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion Rate</span>
                        <span className="font-medium">
                          {((member.completed_story_points / member.total_story_points) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(member.completed_story_points / member.total_story_points) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Agile Metrics Tab */}
        <TabsContent value="agile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cycle Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance?.cycleTime ? `${performance.cycleTime} days` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Average time to complete tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lead Time</CardTitle>
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance?.leadTime ? `${performance.leadTime} days` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">From request to delivery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retrospectives</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{retrospectives.length}</div>
                <p className="text-xs text-muted-foreground">
                  {retrospectives.filter(r => r.status === 'PUBLISHED').length} published
                </p>
              </CardContent>
            </Card>
          </div>

          {performance?.burndownData && performance.burndownData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Burndown Trends
                </CardTitle>
                <CardDescription>Sprint completion patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performance.burndownData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="remaining" 
                        stroke="#3b82f6" 
                        name="Remaining Work"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ideal" 
                        stroke="#94a3b8" 
                        name="Ideal Burndown"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Health Indicators Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Timeliness</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthIndicators ? (
                    healthIndicators.overdue_tasks === 0 ? (
                      <span className="text-green-500">On Track</span>
                    ) : healthIndicators.overdue_tasks <= 2 ? (
                      <span className="text-orange-500">At Risk</span>
                    ) : (
                      <span className="text-red-500">Behind</span>
                    )
                  ) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthIndicators?.overdue_tasks || 0} overdue tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthIndicators ? (
                    healthIndicators.total_bugs === 0 ? (
                      <span className="text-green-500">Excellent</span>
                    ) : (healthIndicators.resolved_bugs / healthIndicators.total_bugs) >= 0.8 ? (
                      <span className="text-green-500">Good</span>
                    ) : (healthIndicators.resolved_bugs / healthIndicators.total_bugs) >= 0.5 ? (
                      <span className="text-orange-500">Fair</span>
                    ) : (
                      <span className="text-red-500">Poor</span>
                    )
                  ) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthIndicators?.resolved_bugs || 0} of {healthIndicators?.total_bugs || 0} bugs resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Velocity Stability</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthIndicators ? (
                    healthIndicators.velocity_stddev <= healthIndicators.avg_velocity * 0.2 ? (
                      <span className="text-green-500">Stable</span>
                    ) : healthIndicators.velocity_stddev <= healthIndicators.avg_velocity * 0.4 ? (
                      <span className="text-orange-500">Variable</span>
                    ) : (
                      <span className="text-red-500">Unstable</span>
                    )
                  ) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Std dev: {healthIndicators?.velocity_stddev?.toFixed(1) || 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Detailed Health Metrics
              </CardTitle>
              <CardDescription>Comprehensive project health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Timeliness Indicator</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overdue Tasks</span>
                      <span className="text-sm font-medium">{healthIndicators?.overdue_tasks || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          (healthIndicators?.overdue_tasks || 0) === 0 ? 'bg-green-500' :
                          (healthIndicators?.overdue_tasks || 0) <= 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((healthIndicators?.overdue_tasks || 0) * 25, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Quality Indicator</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bug Resolution Rate</span>
                      <span className="text-sm font-medium">
                        {healthIndicators && healthIndicators.total_bugs > 0
                          ? `${((healthIndicators.resolved_bugs / healthIndicators.total_bugs) * 100).toFixed(1)}%`
                          : '100%'
                        }
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          !healthIndicators || healthIndicators.total_bugs === 0 ? 'bg-green-500' :
                          (healthIndicators.resolved_bugs / healthIndicators.total_bugs) >= 0.8 ? 'bg-green-500' :
                          (healthIndicators.resolved_bugs / healthIndicators.total_bugs) >= 0.5 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: healthIndicators && healthIndicators.total_bugs > 0
                            ? `${(healthIndicators.resolved_bugs / healthIndicators.total_bugs) * 100}%`
                            : '100%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Velocity Stability</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Velocity</span>
                      <span className="text-sm font-medium">{healthIndicators?.avg_velocity?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Standard Deviation</span>
                      <span className="text-sm font-medium">{healthIndicators?.velocity_stddev?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Lower standard deviation indicates more stable velocity
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retrospectives Tab */}
        <TabsContent value="retrospectives" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Retrospective Summary
                </CardTitle>
                <CardDescription>Feedback distribution across retrospectives</CardDescription>
              </CardHeader>
              <CardContent>
                {retroItemCount > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={retroChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {retroChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    No retrospective data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Top Feedback Items
                </CardTitle>
                <CardDescription>Most voted items from retrospectives</CardDescription>
              </CardHeader>
              <CardContent>
                {retrospectives.length > 0 ? (
                  <div className="space-y-4">
                    {retrospectives.slice(0, 3).map((retro) => (
                      <div key={retro.id} className="space-y-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          Sprint Retrospective • {new Date(retro.created_at).toLocaleDateString()}
                        </div>
                        {retro.items && retro.items.slice(0, 2).map((item) => (
                          <div 
                            key={item.id} 
                            className="p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {item.type === 'WELL' && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                                {item.type === 'BAD' && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                                {item.type === 'ACTION' && (
                                  <Target className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="text-sm font-medium capitalize">{item.type.toLowerCase()}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.votes} votes
                              </div>
                            </div>
                            <p className="text-sm">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    No retrospectives available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Retrospectives</CardTitle>
              <CardDescription>History of team feedback sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {retrospectives.length > 0 ? (
                <div className="space-y-4">
                  {retrospectives.map((retro) => (
                    <div key={retro.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">Sprint Retrospective</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(retro.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={retro.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {retro.status.toLowerCase()}
                          </Badge>
                          <Badge variant="outline">
                            {retro.items?.length || 0} items
                          </Badge>
                        </div>
                      </div>
                      {retro.items && retro.items.length > 0 && (
                        <div className="space-y-2">
                          {retro.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-sm">
                              <span className="font-medium capitalize">{item.type.toLowerCase()}:</span>
                              <span className="ml-2">{item.content}</span>
                            </div>
                          ))}
                          {retro.items.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{retro.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No retrospectives available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Retrospective Trends
              </CardTitle>
              <CardDescription>Sentiment and feedback patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trends && trends.sentimentTrend && trends.sentimentTrend.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends.sentimentTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="positive" 
                        stroke="#10b981" 
                        name="Positive Feedback"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="negative" 
                        stroke="#ef4444" 
                        name="Areas for Improvement"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actions" 
                        stroke="#3b82f6" 
                        name="Action Items"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Common Feedback Themes
                </CardTitle>
                <CardDescription>Most frequently mentioned items</CardDescription>
              </CardHeader>
              <CardContent>
                {trends && trends.mostCommonItems && trends.mostCommonItems.length > 0 ? (
                  <div className="space-y-4">
                    {trends.mostCommonItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="mt-1">
                          {item.type === 'WELL' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {item.type === 'BAD' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          {item.type === 'ACTION' && (
                            <Target className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{item.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.type.toLowerCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Mentioned {item.count} times
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    No common themes identified
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Action Items
                </CardTitle>
                <CardDescription>Most voted action items by status</CardDescription>
              </CardHeader>
              <CardContent>
                {trends && trends.topActionItems && trends.topActionItems.length > 0 ? (
                  <div className="space-y-4">
                    {trends.topActionItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <Badge variant={item.status === 'RESOLVED' ? 'default' : 'secondary'}>
                              {item.status.toLowerCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.votes} votes
                          </div>
                        </div>
                        <p className="text-sm">{item.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    No action items available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

