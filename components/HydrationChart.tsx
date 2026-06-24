'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const data = [
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

    useEffect(() => {
        if (!svgRef.current || !wrapperRef.current) return;
        
        // Make it responsive by using wrapper's width
        const width = wrapperRef.current.clientWidth || 300;
        const height = 150;
        const margin = { top: 10, right: 10, bottom: 20, left: 10 };

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        
        const graphWidth = width - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom;

        const x = d3.scalePoint()
            .domain(data.map(d => d.day))
            .range([0, graphWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, 3]) // 0 to 3 liters
            .range([graphHeight, 0]);

        const area = d3.area<typeof data[0]>()
            .x(d => x(d.day) as number)
            .y0(graphHeight)
            .y1(d => y(d.amount))
            .curve(d3.curveMonotoneX);

        const line = d3.line<typeof data[0]>()
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
            .datum(data)
            .attr('fill', 'url(#hydration-gradient)')
            .attr('d', area);

        // Draw line
        g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#2563EB')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Draw data points
        g.selectAll('.dot')
            .data(data)
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

        // Add subtle horizontal grid lines for Y values (0, 1.5, 3)
        const yTicks = [1, 2, 3];
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

    }, []);

    return (
        <div ref={wrapperRef} className="w-full h-[150px] mt-4 flex items-center justify-center relative">
            <svg ref={svgRef} width="100%" height="100%" preserveAspectRatio="none"></svg>
        </div>
    );
}
