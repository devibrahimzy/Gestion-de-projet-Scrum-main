import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardService } from '@/features/dashboard/dashboard.service';
import { VelocityData, AgilePerformance, MemberWorkload, HealthIndicators, AnalyticsResponse, DashboardSummary, CurrentSprint, VelocityComparison, SprintData } from '@/features/dashboard/dashboard.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AlertCircle, TrendingUp, BarChart3, Zap, Target, GitPullRequest, Calendar, CheckCircle2, AlertTriangle, Users, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { WorkloadChart } from '@/features/dashboard/Charts';



export default function AnalyticsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [velocity, setVelocity] = useState<VelocityData[]>([]);
  const [performance, setPerformance] = useState<AgilePerformance | null>(null);
  const [workload, setWorkload] = useState<MemberWorkload[]>([]);
  const [healthIndicators, setHealthIndicators] = useState<HealthIndicators | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [currentSprint, setCurrentSprint] = useState<CurrentSprint | null>(null);
  const [velocityComparison, setVelocityComparison] = useState<VelocityComparison | null>(null);
  const [sprints, setSprints] = useState<SprintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const analyticsResponse = await dashboardService.getAllAnalytics(projectId);

        setAnalyticsData(analyticsResponse);
        setSummary(analyticsResponse.summary);
        setCurrentSprint(analyticsResponse.currentSprint);
        setWorkload(analyticsResponse.workload);
        setVelocity(analyticsResponse.velocity);
        setVelocityComparison(analyticsResponse.velocityComparison);
        setPerformance(analyticsResponse.agile);
        setHealthIndicators(analyticsResponse.health);
        setSprints(analyticsResponse.sprints);
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
    name: sprint.name,
    Planned: sprint.planned_velocity,
    Actual: sprint.actual_velocity,
  }));

  // Calculate velocity statistics
  const avgPlannedVelocity = velocity.length > 0
    ? velocity.reduce((sum, sprint) => sum + sprint.planned_velocity, 0) / velocity.length
    : 0;
  const avgActualVelocity = velocity.length > 0
    ? velocity.reduce((sum, sprint) => sum + sprint.actual_velocity, 0) / velocity.length
    : 0;
  const velocityAccuracy = avgPlannedVelocity > 0
    ? (avgActualVelocity / avgPlannedVelocity) * 100
    : 0;



  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Project Analytics</h1>
        <p className="text-muted-foreground">
          Long-term insights and performance trends for your project
        </p>
      </div>

      {/* Project Summary and Current Sprint */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.project_name}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total_items} total items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.total_items > 0 ? `${((summary.completed_items / summary.total_items) * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.completed_items} of {summary.total_items} items done
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Story Points</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.completed_story_points}/{summary.total_story_points}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed vs total points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{summary.overdue_items}</div>
              <p className="text-xs text-muted-foreground">
                Items past due date
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Sprint Information */}
      {currentSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Sprint: {currentSprint.name}
            </CardTitle>
            <CardDescription>
              {new Date(currentSprint.start_date).toLocaleDateString()} - {new Date(currentSprint.end_date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge variant={currentSprint.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {currentSprint.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Tasks</div>
                <div className="text-lg font-bold">
                  {currentSprint.completed_tasks}/{currentSprint.total_tasks}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Story Points</div>
                <div className="text-lg font-bold">
                  {currentSprint.completed_story_points}/{currentSprint.total_story_points}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Days Remaining</div>
                <div className={`text-lg font-bold ${currentSprint.days_remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {currentSprint.days_remaining < 0 ? `${Math.abs(currentSprint.days_remaining)} overdue` : `${currentSprint.days_remaining} left`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

       <Tabs defaultValue="overview" className="space-y-6">
         <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
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
            
         </TabsList>

         {/* Overview Tab */}
         <TabsContent value="overview" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Lead Time</CardTitle>
                 <GitPullRequest className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">
                   {performance?.avg_lead_time_hours ? `${Number(performance.avg_lead_time_hours).toFixed(2)}h` : 'N/A'}
                 </div>
                 <p className="text-xs text-muted-foreground">Average lead time</p>
               </CardContent>
             </Card>

             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Cycle Time</CardTitle>
                 <Calendar className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">
                   {performance?.avg_cycle_time_hours ? `${Number(performance.avg_cycle_time_hours).toFixed(2)}h` : 'N/A'}
                 </div>
                 <p className="text-xs text-muted-foreground">Average cycle time</p>
               </CardContent>
             </Card>

             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Avg Velocity</CardTitle>
                 <TrendingUp className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">
                   {velocityComparison?.avg_velocity ? Number(velocityComparison.avg_velocity).toFixed(2) : 'N/A'}
                 </div>
                 <p className="text-xs text-muted-foreground">Story points per sprint</p>
               </CardContent>
             </Card>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Users className="h-5 w-5" />
                   Team Performance
                 </CardTitle>
                 <CardDescription>Current sprint progress by team member</CardDescription>
               </CardHeader>
               <CardContent>
                 {workload.length > 0 ? (
                   <div className="space-y-4">
                     {workload.slice(0, 3).map((member) => (
                       <div key={member.id} className="flex items-center justify-between">
                         <div>
                           <div className="font-medium">{member.first_name} {member.last_name}</div>
                           <div className="text-sm text-muted-foreground">
                             {member.completed_tasks}/{member.assigned_tasks} tasks completed
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="font-medium">{member.completed_story_points}/{member.total_story_points} pts</div>
                           <div className="text-sm text-muted-foreground">
                             {member.total_story_points > 0 ? `${((member.completed_story_points / member.total_story_points) * 100).toFixed(0)}%` : '0%'}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8 text-muted-foreground text-sm">
                     No team data available
                   </div>
                 )}
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Activity className="h-5 w-5" />
                   Sprint Overview
                 </CardTitle>
                 <CardDescription>Recent sprint status summary</CardDescription>
               </CardHeader>
               <CardContent>
                 {sprints.length > 0 ? (
                   <div className="space-y-4">
                     {sprints.slice(0, 3).map((sprint, index) => (
                       <div key={index} className="flex items-center justify-between">
                         <div>
                           <div className="font-medium">{sprint.name}</div>
                           <Badge variant={sprint.status === 'ACTIVE' ? 'default' : sprint.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                             {sprint.status}
                           </Badge>
                         </div>
                         <div className="text-right">
                           <div className="font-medium">{sprint.done_tasks}/{sprint.total_tasks} tasks</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8 text-muted-foreground text-sm">
                     No sprint data available
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
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
                   {performance?.avg_cycle_time_hours ? `${Number(performance.avg_cycle_time_hours).toFixed(2)} hours` : 'N/A'}
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
                   {performance?.avg_lead_time_hours ? `${Number(performance.avg_lead_time_hours).toFixed(2)} hours` : 'N/A'}
                 </div>
                 <p className="text-xs text-muted-foreground">From request to delivery</p>
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
                  Std dev: {Number(healthIndicators?.velocity_stddev || 0).toFixed(1) || 'N/A'}
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
                         <span className="text-sm font-medium">{Number(healthIndicators?.avg_velocity || 0).toFixed(2) || 'N/A'}</span>
                       </div>
                     </div>
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-sm">Standard Deviation</span>
                         <span className="text-sm font-medium">{Number(healthIndicators?.velocity_stddev || 0).toFixed(2) || 'N/A'}</span>
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




      </Tabs>
    </div>
  );
}

