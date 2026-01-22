import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { VelocityChartData } from './sprints.types';
import { format, parseISO } from 'date-fns';

interface VelocityChartProps {
    data: VelocityChartData;
    className?: string;
}

export default function VelocityChart({ data, className = "" }: VelocityChartProps) {
    // Prepare data for the chart
    const chartData = data.sprints.map((sprint, index) => ({
        name: sprint.name,
        date: format(parseISO(sprint.start_date), 'MMM yyyy'),
        planned: sprint.planned_velocity,
        actual: sprint.actual_velocity,
        movingAverage: data.moving_average[index],
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value} story points`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Team Velocity Chart</h3>
                <p className="text-sm text-gray-600">
                    Shows planned vs actual velocity with moving average trend
                </p>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Planned velocity bars */}
                    <Bar
                        dataKey="planned"
                        fill="#8884d8"
                        name="Planned Velocity"
                        opacity={0.7}
                    />

                    {/* Actual velocity bars */}
                    <Bar
                        dataKey="actual"
                        fill="#82ca9d"
                        name="Actual Velocity"
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Moving Average Line Chart */}
            <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Velocity Trend (Moving Average)</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Moving average line */}
                        <Line
                            type="monotone"
                            dataKey="movingAverage"
                            stroke="#ff7300"
                            strokeWidth={3}
                            name="Moving Average"
                            dot={{ fill: '#ff7300', strokeWidth: 2, r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}