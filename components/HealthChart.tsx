'use client';

import * as React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HealthChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737686' }} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#004ac6', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={4} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}
