import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'; // <-- Hapus linearGradient dan stop dari sini

const StatsChart = ({ data, barColor, gradientFrom, gradientTo }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const average = data.reduce((acc, entry) => acc + (entry.requests || entry.value), 0) / data.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2 rounded-lg shadow-xl text-xs border border-slate-700">
          <p className="font-bold">{`${label}: ${payload[0].value} requests`}</p>
        </div>
      );
    }
    return null;
  };

  const gradientId = `grad-${barColor.replace('#', '')}`;
  
  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart 
        data={data} 
        margin={{ top: 15, right: 0, left: 0, bottom: 0 }}
        onMouseMove={(state) => {
          if (state.isTooltipActive) setActiveIndex(state.activeTooltipIndex);
          else setActiveIndex(null);
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {/* 'defs', 'linearGradient', dan 'stop' adalah tag SVG standar, tidak perlu diimpor */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientFrom || barColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={gradientTo || barColor} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
            
        <Tooltip
          cursor={{ fill: 'transparent' }}
          content={<CustomTooltip />}
          position={{ y: -35 }}
          animationEasing="ease-out"
        />

        <ReferenceLine 
          y={average} 
          stroke="#9ca3af" 
          strokeDasharray="3 3"
          strokeOpacity={0.5}
        />

        <Bar dataKey="requests" fill={`url(#${gradientId})`} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={activeIndex === index ? barColor : `url(#${gradientId})`}
              opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
              style={{ transition: 'fill 0.2s ease-in-out, opacity 0.2s ease-in-out' }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StatsChart;