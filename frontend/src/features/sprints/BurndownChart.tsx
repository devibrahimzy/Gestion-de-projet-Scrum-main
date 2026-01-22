import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { BurndownChartData } from './sprints.types';
import { format, parseISO, isValid } from 'date-fns';

interface BurndownChartProps {
    data: BurndownChartData;
    className?: string;
}

export default function BurndownChart({ data, className = "" }: BurndownChartProps) {

    // ===============================
    // Prepare chart data
    // ===============================
    const chartData = data.ideal_line.map((idealPoint) => {
        const actualPoint = data.actual_line.find(
            (actual) => actual.date === idealPoint.date
        );

        const parsedDate = parseISO(idealPoint.date);

        return {
            date: idealPoint.date, // ISO date (source of truth)
            ideal: idealPoint.remaining_story_points,
            actual: actualPoint?.remaining_story_points ?? null,
            formattedDate: isValid(parsedDate)
                ? format(parsedDate, 'MMM dd')
                : idealPoint.date,
        };
    });

    // ===============================
    // Sprint status
    // ===============================
    const latestActual = data.actual_line[data.actual_line.length - 1];
    const latestIdeal = data.ideal_line[data.ideal_line.length - 1];

    const isAhead =
        latestActual &&
        latestActual.remaining_story_points < latestIdeal.remaining_story_points;

    const isBehind =
        latestActual &&
        latestActual.remaining_story_points > latestIdeal.remaining_story_points;

    // ===============================
    // Custom Tooltip (FIXED)
    // ===============================
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const date = payload[0]?.payload?.date;
        const parsedDate = parseISO(date);

        return (
            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                <p className="font-medium">
                    Date:{' '}
                    {isValid(parsedDate)
                        ? format(parsedDate, 'PPP')
                        : 'Invalid date'}
                </p>

                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value ?? '—'} story points
                    </p>
                ))}
            </div>
        );
    };

    // ===============================
    // Render
    // ===============================
    return (
        <div className={`w-full ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold">
                    Burndown Chart - {data.sprint.name}
                </h3>

                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>
                        Start:{' '}
                        {format(parseISO(data.sprint.start_date), 'PPP')}
                    </span>
                    <span>
                        End:{' '}
                        {format(parseISO(data.sprint.end_date), 'PPP')}
                    </span>
                    <span>
                        Capacity: {data.sprint.planned_velocity} points
                    </span>
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
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis
                        tick={{ fontSize: 12 }}
                        label={{
                            value: 'Story Points Remaining',
                            angle: -90,
                            position: 'insideLeft',
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="ideal"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Ideal Burndown"
                        dot={false}
                    />

                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Actual Burndown"
                        dot={{ fill: '#82ca9d', r: 4 }}
                        connectNulls={false}
                    />

                    <ReferenceLine y={0} stroke="#666" strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
