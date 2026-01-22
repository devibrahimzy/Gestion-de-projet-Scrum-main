import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface VelocityChartProps {
  data: { sprintName: string; planned: number; actual: number }[];
}

export const VelocityChart: React.FC<VelocityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sprintName" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="planned" fill="#3b82f6" name="Planned" />
        <Bar dataKey="actual" fill="#10b981" name="Actual" />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface BurndownChartProps {
  data: Array<{ date: string; completed_tasks: number; completed_points: number }>;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ data }) => {
  // Calculate cumulative completed points
  const cumulativeData = data.reduce((acc, item, index) => {
    const prev = acc[index - 1] || { cumulative: 0 };
    return [...acc, {
      date: new Date(item.date).toLocaleDateString(),
      cumulative: prev.cumulative + item.completed_points
    }];
  }, [] as Array<{ date: string; cumulative: number }>);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={cumulativeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="cumulative" stroke="#10b981" name="Completed Story Points" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface WorkloadChartProps {
  data: Array<{
    first_name: string;
    last_name: string;
    assigned_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    total_story_points: number;
    completed_story_points: number;
  }>;
}

export const WorkloadChart: React.FC<WorkloadChartProps> = ({ data }) => {
  const chartData = data.map(member => ({
    name: `${member.first_name} ${member.last_name}`,
    Assigned: member.assigned_tasks,
    Completed: member.completed_tasks,
    'In Progress': member.in_progress_tasks,
    'Story Points': member.total_story_points,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Assigned" fill="#3b82f6" name="Assigned Tasks" />
        <Bar dataKey="Completed" fill="#10b981" name="Completed Tasks" />
        <Bar dataKey="In Progress" fill="#f59e0b" name="In Progress Tasks" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VelocityChart;
