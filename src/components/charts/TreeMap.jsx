import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  {
    name: 'Product Categories',
    children: [
      {
        name: 'Electronics',
        children: [
          { name: 'Laptops', size: 4000, color: '#8884d8' },
          { name: 'Smartphones', size: 3800, color: '#83a6ed' },
          { name: 'Tablets', size: 1908, color: '#8dd1e1' },
          { name: 'Cameras', size: 1680, color: '#82ca9d' },
        ],
      },
      {
        name: 'Clothing',
        children: [
          { name: 'Men\'s', size: 3500, color: '#a4de6c' },
          { name: 'Women\'s', size: 4200, color: '#d0ed57' },
          { name: 'Kids', size: 2400, color: '#ffc658' },
        ],
      },
      {
        name: 'Home',
        children: [
          { name: 'Furniture', size: 3000, color: '#ff7300' },
          { name: 'Decor', size: 2800, color: '#ff5e4d' },
          { name: 'Kitchen', size: 2900, color: '#e14eca' },
        ],
      },
    ],
  },
];

const CustomTreemap = ({ root, depth, x, y, width, height, index, colors, name, value }) => {
  return (
    <g>
      {root.children && root.children.map((node, i) => (
        <rect
          key={`rect-${i}`}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          style={{
            fill: node.children ? null : node.color,
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
      ))}
      
      {/* Add text labels for larger rectangles */}
      {root.children && root.children.map((node, i) => {
        const fontSize = Math.min(16, Math.max(8, node.width / 8));
        if ((node.width > 50 && node.height > 30) || node.width > 100) {
          return (
            <text
              key={`text-${i}`}
              x={node.x + node.width / 2}
              y={node.y + node.height / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={fontSize}
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {node.name}
            </text>
          );
        }
        return null;
      })}
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, size } = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
        <p className="font-medium">{name}</p>
        <p className="text-sm">Revenue: ${size.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const TreeMapChart = () => {
  return (
    <div className="h-72">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Product Revenue Distribution</h2>
      <ResponsiveContainer width="100%" height="90%">
        <Treemap
          data={data}
          dataKey="size"
          ratio={4/3}
          stroke="#fff"
          fill="#8884d8"
          animationDuration={1000}
          content={<CustomTreemap />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default TreeMapChart;