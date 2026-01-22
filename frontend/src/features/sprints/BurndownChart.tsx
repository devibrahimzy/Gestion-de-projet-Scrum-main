import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BurndownChartData } from './sprints.types';
import { format, parseISO } from 'date-fns';

interface BurndownChartProps {
    data: BurndownChartData;
    className?: string;
}

export default function BurndownChart({ data, className = "" }: BurndownChartProps) {
    // Prepare data for the chart by merging ideal and actual lines
    const chartData = data.ideal_line.map((idealPoint) => {
        const actualPoint = data.actual_line.find(
            (actual) => actual.date === idealPoint.date
        );

        return {
            date: idealPoint.date,
            ideal: idealPoint.remaining_story_points,
            actual: actualPoint?.remaining_story_points ?? null,
            formattedDate: format(parseISO(idealPoint.date), 'MMM dd'),
        };
    });

    // Calculate if team is ahead or behind
    const latestActual = data.actual_line[data.actual_line.length - 1];
    const latestIdeal = data.ideal_line[data.ideal_line.length - 1];
    const isAhead = latestActual && latestActual.remaining_story_points < latestIdeal.remaining_story_points;
    const isBehind = latestActual && latestActual.remaining_story_points > latestIdeal.remaining_story_points;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-medium">{`Date: ${format(parseISO(label), 'PPP')}`}</p>
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
                <h3 className="text-lg font-semibold">Burndown Chart - {data.sprint.name}</h3>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>Start: {format(parseISO(data.sprint.start_date), 'PPP')}</span>
                    <span>End: {format(parseISO(data.sprint.end_date), 'PPP')}</span>
                    <span>Capacity: {data.sprint.planned_velocity} points</span>
                </div>
                {isAhead && (
                    <div className="mt-2 text-green-600 text-sm font-medium">
                        🎉 Team is ahead of schedule!
                    </div>
                )}
                {isBehind && (
                    <div className="mt-2 text-red-600 text-sm font-medium">
                        ⚠️ Team is behind schedule
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        label={{ value: 'Story Points Remaining', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Ideal line */}
                    <Line
                        type="monotone"
                        dataKey="ideal"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Ideal Burndown"
                        dot={false}
                    />

                    {/* Actual line */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Actual Burndown"
                        dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                        connectNulls={false}
                    />

                    {/* Reference line at 0 */}
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}