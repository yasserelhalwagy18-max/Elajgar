'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Body zones and their reported pain frequency
const painData = [
  { id: 'head', label: 'سر', frequency: 15, x: 50, y: 15, radius: 25 },
  { id: 'neck', label: 'گردن', frequency: 45, x: 50, y: 35, radius: 18 },
  { id: 'shoulders', label: 'شانه‌ها', frequency: 65, x: 50, y: 50, w: 60, h: 20 },
  { id: 'chest', label: 'قفسه سینه', frequency: 20, x: 50, y: 65, w: 40, h: 30 },
  { id: 'back', label: 'کمر', frequency: 85, x: 50, y: 80, w: 40, h: 40 }, // High pain
  { id: 'arms', label: 'دست‌ها', frequency: 30, x: 20, y: 70, w: 15, h: 60 },
  { id: 'arms_r', label: 'دست‌ها', frequency: 30, x: 80, y: 70, w: 15, h: 60 },
  { id: 'hips', label: 'لگن', frequency: 40, x: 50, y: 110, w: 50, h: 25 },
  { id: 'knees', label: 'زانوها', frequency: 75, x: 35, y: 150, radius: 20 },
  { id: 'knees_r', label: 'زانوها', frequency: 70, x: 65, y: 150, radius: 20 },
  { id: 'feet', label: 'پاها', frequency: 25, x: 35, y: 190, w: 20, h: 15 },
  { id: 'feet_r', label: 'پاها', frequency: 25, x: 65, y: 190, w: 20, h: 15 },
];

export default function PainHeatmap() {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 300;
        const height = 400;

        // Custom human body path or simplified representation
        // For simplicity, we'll draw zones as glowing circles/rectangles with an abstract body outline
        
        // Abstract body outline (simple rounded rects)
        const gBody = svg.append('g').attr('class', 'body-outline')
            .attr('transform', `scale(${width/100}, ${height/220})`); // Mapping from 0-100 x and 0-220 y
        
        // Define color scale for heat
        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 100]);

        // Tooltip setup
        const tooltip = d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'rgba(255, 255, 255, 0.9)')
            .style('backdrop-filter', 'blur(10px)')
            .style('border', '1px solid rgba(255,255,255,0.5)')
            .style('border-radius', '8px')
            .style('padding', '8px 12px')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('color', '#1e293b')
            .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');

        // Draw pain zones
        const zones = gBody.selectAll('.zone')
            .data(painData)
            .enter()
            .append('g');

        zones.each(function(d) {
            const el = d3.select(this);
            
            // Background glow filter
            const filterId = `glow-${d.id}`;
            const defs = svg.append('defs');
            const filter = defs.append('filter')
                .attr('id', filterId)
                .attr('x', '-50%')
                .attr('y', '-50%')
                .attr('width', '200%')
                .attr('height', '200%');
                
            filter.append('feGaussianBlur')
                .attr('stdDeviation', '4')
                .attr('result', 'coloredBlur');
                
            const feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode').attr('in', 'coloredBlur');
            feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

            if (d.radius) {
                el.append('circle')
                    .attr('cx', d.x)
                    .attr('cy', d.y)
                    .attr('r', d.radius)
                    .attr('fill', colorScale(d.frequency))
                    .attr('opacity', 0.8)
                    .style('filter', `url(#${filterId})`);
            } else if (d.w && d.h) {
                el.append('rect')
                    .attr('x', d.x - d.w / 2)
                    .attr('y', d.y - d.h / 2)
                    .attr('width', d.w)
                    .attr('height', d.h)
                    .attr('rx', 10)
                    .attr('fill', colorScale(d.frequency))
                    .attr('opacity', 0.8)
                    .style('filter', `url(#${filterId})`);
            }
        });

        // Interactions
        zones
            .on('mouseover', (event, d) => {
                tooltip.style('visibility', 'visible')
                       .html(`ناحیه: ${d.label}<br/>گزارش‌ها: %${d.frequency}`);
                d3.select(event.currentTarget).select('*').attr('opacity', 1).attr('stroke', '#fff').attr('stroke-width', 2);
            })
            .on('mousemove', (event) => {
                tooltip.style('top', (event.pageY - 10) + 'px')
                       .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', (event) => {
                tooltip.style('visibility', 'hidden');
                d3.select(event.currentTarget).select('*').attr('opacity', 0.8).attr('stroke', 'none');
            });

        return () => {
             d3.selectAll('.d3-tooltip').remove();
        };

    }, []);

    return (
        <div className="w-full flex justify-center items-center h-[400px]">
             <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 300 400" className="drop-shadow-2xl"></svg>
        </div>
    );
}
