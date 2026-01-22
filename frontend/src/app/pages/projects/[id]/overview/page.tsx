import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardService } from '@/features/dashboard/dashboard.service';
import { DashboardSummary, VelocityData, AgilePerformance, CurrentSprint, VelocityComparison, BurndownData } from '@/features/dashboard/dashboard.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Loader2, AlertCircle, Users, CheckCircle2, Zap, TrendingUp, Activity, Calendar, Target, Clock } from 'lucide-react';
import { BurndownChart } from '@/features/dashboard/Charts';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';



export default function ProjectOverview() {
  const { id } = useParams<{ id: string }>();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [currentSprint, setCurrentSprint] = useState<CurrentSprint | null>(null);
  const [velocity, setVelocity] = useState<VelocityData[]>([]);
  const [velocityComparison, setVelocityComparison] = useState<VelocityComparison | null>(null);
  const [performance, setPerformance] = useState<AgilePerformance | null>(null);
  const [burndownData, setBurndownData] = useState<BurndownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard data
        const [summaryData, currentSprintData, velocityData, velocityCompData, performanceData, burndownData] = await Promise.all([
          dashboardService.getSummary(id),
          dashboardService.getCurrentSprint(id),
          dashboardService.getVelocity(id),
          dashboardService.getVelocityComparison(id),
          dashboardService.getAgilePerformance(id),
          dashboardService.getBurndownData(id),
        ]);

        setSummary(summaryData);
        setCurrentSprint(currentSprintData);
        setVelocity(velocityData);
        setVelocityComparison(velocityCompData);
        setPerformance(performanceData);
        setBurndownData(burndownData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
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
            Error Loading Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive/80">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Safely calculate values with fallbacks
  const projectName = summary?.project_name || 'Project';
  const totalItems = summary?.total_items || 0;
  const completedItems = summary?.completed_items || 0;
  const inProgressItems = summary?.in_progress_items || 0;
  const todoItems = summary?.todo_items || 0;
  const overdueItems = summary?.overdue_items || 0;
  const totalStoryPoints = summary?.total_story_points || 0;
  const completedStoryPoints = summary?.completed_story_points || 0;
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Sprint calculations
  const sprintProgress = currentSprint ? (currentSprint.total_story_points > 0 ? (currentSprint.completed_story_points / currentSprint.total_story_points) * 100 : 0) : 0;

  // Velocity comparison
  const avgVelocity = velocityComparison?.avg_velocity || 0;
  const currentVelocity = velocityComparison?.current_velocity || 0;
  const velocityDiff = currentVelocity - avgVelocity;

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{projectName}</h1>
        <p className="text-muted-foreground">
          Real-time project dashboard and sprint overview
        </p>
      </div>

      {/* Current Sprint Section */}
      {currentSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Sprint: {currentSprint.name}
            </CardTitle>
            <CardDescription>
              {new Date(currentSprint.start_date).toLocaleDateString()} - {new Date(currentSprint.end_date).toLocaleDateString()}
              <span className="ml-2">
                <Badge variant={currentSprint.days_remaining > 0 ? "default" : "destructive"}>
                  {currentSprint.days_remaining} days remaining
                </Badge>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Sprint Progress</div>
                <div className="text-2xl font-bold">{sprintProgress.toFixed(1)}%</div>
                <Progress value={sprintProgress} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Tasks Completed</div>
                <div className="text-2xl font-bold">{currentSprint.completed_tasks}/{currentSprint.total_tasks}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Story Points</div>
                <div className="text-2xl font-bold">{currentSprint.completed_story_points}/{currentSprint.total_story_points}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedItems}</div>
            <p className="text-xs text-muted-foreground">Tasks done</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressItems}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoItems}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueItems}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Velocity Performance
          </CardTitle>
          <CardDescription>Current sprint vs average velocity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Current Velocity</div>
              <div className="text-2xl font-bold">{currentVelocity.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Story points this sprint</p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Average Velocity</div>
              <div className="text-2xl font-bold">{avgVelocity.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Story points average</p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Performance</div>
              <div className={`text-2xl font-bold ${velocityDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {velocityDiff >= 0 ? '+' : ''}{velocityDiff.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {velocityDiff >= 0 ? 'Above average' : 'Below average'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Velocity Chart Section */}
      {velocity && velocity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Velocity Chart
            </CardTitle>
            <CardDescription>Planned vs Actual story points per sprint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-blue-500 rounded"></div>
                    <span className="text-sm font-medium">Planned</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded"></div>
                    <span className="text-sm font-medium">Actual</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {velocity.map((sprint) => (
                  <div key={sprint.sprintName} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{sprint.sprintName}</span>
                      <span className="text-muted-foreground">
                        {sprint.actual}/{sprint.planned}
                      </span>
                    </div>
                    <div className="relative h-6 bg-muted rounded overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-500"
                        style={{ width: `${(sprint.planned / Math.max(...velocity.map(v => v.planned))) * 100}%` }}
                      />
                      <div 
                        className="absolute top-0 left-0 h-full bg-green-500"
                        style={{ width: `${(sprint.actual / Math.max(...velocity.map(v => v.planned))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agile Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Agile Performance
            </CardTitle>
            <CardDescription>Team efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {performance ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Cycle Time</div>
                    <div className="text-2xl font-bold">
                      {performance.cycleTime ? `${performance.cycleTime} days` : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Average time to complete tasks</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Lead Time</div>
                    <div className="text-2xl font-bold">
                      {performance.leadTime ? `${performance.leadTime} days` : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">From request to delivery</p>
                  </div>
                </div>
                
                {/* Backlog Completion Rate */}
                {completionRate !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Backlog Completion</span>
                      <span className="font-medium">{completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-3" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Burndown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sprint Burndown Chart
            </CardTitle>
            <CardDescription>Current sprint progress over time (auto-updated daily)</CardDescription>
          </CardHeader>
          <CardContent>
            {burndownData && burndownData.length > 0 ? (
              <BurndownChart data={burndownData} />
            ) : (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No burndown data available for current sprint
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}