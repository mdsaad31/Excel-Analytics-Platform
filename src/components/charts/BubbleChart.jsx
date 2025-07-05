import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { x: 100, y: 200, z: 200, name: 'Product A', color: '#8884d8' },
  { x: 120, y: 100, z: 260, name: 'Product B', color: '#83a6ed' },
  { x: 170, y: 300, z: 400, name: 'Product C', color: '#8dd1e1' },
  { x: 140, y: 250, z: 280, name: 'Product D', color: '#82ca9d' },
  { x: 150, y: 400, z: 500, name: 'Product E', color: '#a4de6c' },
  { x: 110, y: 280, z: 320, name: 'Product F', color: '#d0ed57' },
  { x: 200, y: 350, z: 150, name: 'Product G', color: '#ffc658' },
  { x: 210, y: 180, z: 390, name: 'Product H', color: '#ff7300' },
  { x: 190, y: 220, z: 290, name: 'Product I', color: '#ff5e4d' },
  { x: 240, y: 300, z: 420, name: 'Product J', color: '#e14eca' },
];

const BubbleChart = () => {
  const domain = [0, 500];
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, x, y, z } = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{name}</p>
          <p className="text-sm">X: {x}</p>
          <p className="text-sm">Y: {y}</p>
          <p className="text-sm">Z: {z} (Size)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Product Performance (3D)</h2>
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Revenue" 
            domain={domain} 
            label={{ value: 'Revenue', position: 'insideBottom', offset: -5 }} 
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Engagement" 
            domain={domain} 
            label={{ value: 'Engagement', angle: -90, position: 'insideLeft' }} 
          />
          <ZAxis 
            type="number" 
            dataKey="z" 
            range={[50, 400]} 
            name="Size" 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {data.map((entry, index) => (
            <Scatter 
              key={index} 
              name={entry.name} 
              data={[entry]} 
              fill={entry.color}
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BubbleChart;