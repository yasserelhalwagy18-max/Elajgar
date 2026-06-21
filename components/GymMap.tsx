'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const gymsData = [
    { id: 1, name: 'اکسیژن', location: 'نیاوران', rating: 4.8, discount: '۳۰٪ تخفیف', x: 200, y: 120 },
    { id: 2, name: 'پرانا', location: 'شهرک غرب', rating: 4.9, discount: 'پکیج سلامت', x: 100, y: 150 },
    { id: 3, name: 'رویال', location: 'سعادت آباد', rating: 4.5, discount: '۲۰٪ تخفیف', x: 80, y: 80 },
    { id: 4, name: 'سپهر', location: 'تهرانپارس', rating: 4.2, discount: '۱۵٪ تخفیف', x: 300, y: 200 },
];

export default function GymMap() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedGym, setSelectedGym] = useState<typeof gymsData[0] | null>(null);

    useEffect(() => {
        if (!svgRef.current) return;
        
        const width = 400;
        const height = 300;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // clear on re-render

        // Draw abstract map roads / topology
        const mapLayer = svg.append('g').attr('class', 'map-layer');
        mapLayer.append('path')
            .attr('d', `M0,100 C150,120 200,50 400,180`)
            .attr('fill', 'none')
            .attr('stroke', '#E2E8F0')
            .attr('stroke-width', 8);

        mapLayer.append('path')
            .attr('d', `M50,300 C100,200 300,150 400,80`)
            .attr('fill', 'none')
            .attr('stroke', '#E2E8F0')
            .attr('stroke-width', 6);
            
        mapLayer.append('path')
            .attr('d', `M200,0 L200,300`)
            .attr('fill', 'none')
            .attr('stroke', '#E2E8F0')
            .attr('stroke-width', 8)
            .attr('stroke-dasharray', '8,8');

        // Draw gym pins
        const gymNodes = svg.selectAll('.gym-node')
            .data(gymsData)
            .enter()
            .append('g')
            .attr('class', 'gym-node cursor-pointer')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .on('click', (event, d) => {
                setSelectedGym(d);
                
                // Reset all nodes
                svg.selectAll('.gym-pin-bg')
                    .attr('fill', '#94A3B8')
                    .attr('r', 12);
                
                // Highlight clicked node
                d3.select(event.currentTarget).select('.gym-pin-bg')
                    .attr('fill', '#3B82F6')
                    .attr('r', 16);
            });

        // Pin background
        gymNodes.append('circle')
            .attr('class', 'gym-pin-bg transition-all duration-300')
            .attr('r', 12)
            .attr('fill', '#94A3B8')
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');

        // Inner dot
        gymNodes.append('circle')
            .attr('r', 4)
            .attr('fill', '#fff');

    }, []);

    return (
        <div className="relative w-full overflow-hidden rounded-[2rem] border-2 border-white/80 shadow-md bg-slate-50 mb-6">
            <div className="w-full h-[250px] overflow-hidden dir-ltr">
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"></svg>
            </div>
            
            {/* Overlay Details */}
            {selectedGym ? (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-on-surface">{selectedGym.name}</h3>
                            <p className="text-sm text-on-surface-variant flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                                {selectedGym.location}
                            </p>
                        </div>
                        <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                            {selectedGym.rating} ★
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                            {selectedGym.discount}
                        </span>
                        <button className="text-sm font-bold text-white bg-primary px-4 py-1.5 rounded-full shadow-md">
                            مسیر یابی
                        </button>
                    </div>
                </div>
            ) : (
                <div className="absolute bottom-4 left-4 right-4 bg-white/70 backdrop-blur-md rounded-2xl p-3 text-center border border-white shadow-sm text-sm font-medium text-on-surface-variant">
                    برای مشاهده جزئیات روی پین‌ها کلیک کنید
                </div>
            )}
        </div>
    );
}
