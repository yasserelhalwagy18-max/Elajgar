'use client';

import * as React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HealthChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#737686', fontWeight: 600 }}
                    dy={10}
                />
                <Tooltip 
                    contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #e0e3e5',
                        background: '#ffffff',
                        boxShadow: '0 10px 25px rgba(37,99,235,0.1)',
                        padding: '12px'
                    }}
                    itemStyle={{ color: '#2563EB', fontWeight: 'bold', fontSize: '16px' }}
                    labelStyle={{ color: '#737686', fontSize: '12px', marginBottom: '4px' }}
                    cursor={{ stroke: '#dbe1ff', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={4}
                    dot={{ r: 5, fill: '#ffffff', strokeWidth: 2, stroke: '#2563EB' }}
                    activeDot={{ r: 7, fill: '#2563EB', stroke: '#ffffff', strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
