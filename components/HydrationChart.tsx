'use client';

import * as React from 'react';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useStore } from '@/lib/store';

const mockData = [
    { day: 'شنبه', amount: 1.2 },
    { day: 'یکشنبه', amount: 1.5 },
    { day: 'دوشنبه', amount: 1.0 },
    { day: 'سه‌شنبه', amount: 2.2 },
    { day: 'چهارشنبه', amount: 1.8 },
    { day: 'پنجشنبه', amount: 2.5 },
    { day: 'جمعه', amount: 2.0 },
];

export default function HydrationChart() {
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const userProfile = useStore(state => state.userProfile);

    const chartData = useMemo(() => {
        if (!userProfile) return { data: mockData, hasEnoughData: false };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const generatedData = [];
        let validEntriesCount = 0;

        const formatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const dayLabel = formatter.format(d);

            const log = userProfile.dailyLogs?.find(l => l.date === dateStr);

            if (log) {
                validEntriesCount++;
            }

            const amount = log?.waterIntake ? Number((log.waterIntake / 1000).toFixed(1)) : 0;

            generatedData.push({ day: dayLabel, amount });
        }

        return { data: generatedData, hasEnoughData: validEntriesCount >= 3 };
    }, [userProfile]);

    const { data: activeData, hasEnoughData } = chartData;

    useEffect(() => {
        if (!svgRef.current || !wrapperRef.current || !hasEnoughData) return;
        
        // Make it responsive by using wrapper's width
        const width = wrapperRef.current.clientWidth || 300;
        const height = 150;
        const margin = { top: 10, right: 10, bottom: 20, left: 10 };

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        
        const graphWidth = width - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom;

        const x = d3.scalePoint()
            .domain(activeData.map(d => d.day))
            .range([0, graphWidth])
            .padding(0.1);

        const maxAmount = d3.max(activeData, d => d.amount) || 0;
        const yMax = Math.max(3, Math.ceil(maxAmount)); // Dynamic upper limit, minimum 3

        const y = d3.scaleLinear()
            .domain([0, yMax])
            .range([graphHeight, 0]);

        const area = d3.area<typeof activeData[0]>()
            .x(d => x(d.day) as number)
            .y0(graphHeight)
            .y1(d => y(d.amount))
            .curve(d3.curveMonotoneX);

        const line = d3.line<typeof activeData[0]>()
            .x(d => x(d.day) as number)
            .y(d => y(d.amount))
            .curve(d3.curveMonotoneX);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Gradient for the area
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'hydration-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
            
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#dbe1ff'); // Primary container color
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(219, 225, 255, 0)');

        // Draw area
        g.append('path')
            .datum(activeData)
            .attr('fill', 'url(#hydration-gradient)')
            .attr('d', area);

        // Draw line
        g.append('path')
            .datum(activeData)
            .attr('fill', 'none')
            .attr('stroke', '#2563EB')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Draw data points
        g.selectAll('.dot')
            .data(activeData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.day) as number)
            .attr('cy', d => y(d.amount))
            .attr('r', 5)
            .attr('fill', '#fff')
            .attr('stroke', '#2563EB')
            .attr('stroke-width', 2);

        // Add X axis only (simpler)
        const xAxis = d3.axisBottom(x).tickSize(0).tickPadding(10);
        g.append('g')
            .attr('transform', `translate(0,${graphHeight})`)
            .call(xAxis)
            .select('.domain').remove(); // remove axis line

        // Customize X axis text
        g.selectAll('.tick text')
            .attr('font-size', '11px')
            .attr('fill', '#737686')
            .attr('font-weight', '600')
            .attr('font-family', 'inherit');

        // Add subtle horizontal grid lines for Y values based on yMax
        const yTicks = d3.range(1, yMax + 1);
        g.selectAll('.grid-line')
            .data(yTicks)
            .enter().append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', graphWidth)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', '#f1f5f9')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

    }, [activeData, hasEnoughData]);

    if (!hasEnoughData) {
        return (
            <div className="flex flex-col items-center justify-center h-[150px] mt-4 text-center gap-2">
                <svg className="w-6 h-6 text-on-surface-variant/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-on-surface-variant text-xs">
                    هنوز داده کافی ندارید. بعد از چند روز استفاده، نمودار نمایش داده می‌شود.
                </p>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="w-full h-[150px] mt-4 flex items-center justify-center relative">
            <svg ref={svgRef} width="100%" height="100%" preserveAspectRatio="none"></svg>
        </div>
    );
}
