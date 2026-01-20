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
  data: Array<{ day: string; ideal: number; actual: number }>;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ideal" stroke="#3b82f6" strokeDasharray="5 5" name="Ideal" />
        <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default VelocityChart;
