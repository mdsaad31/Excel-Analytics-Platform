import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GaugeChart = ({ value = 75, min = 0, max = 100, title = "Performance" }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  const getColor = (percent) => {
    if (percent < 30) return '#FF4560';
    if (percent < 70) return '#FEB019';
    return '#00E396';
  };

  useEffect(() => {
    const animationDuration = 1000;
    const stepTime = 10;
    const steps = animationDuration / stepTime;
    const stepValue = value / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep += 1;
      setAnimatedValue(Math.min(currentStep * stepValue, value));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);

  const data = [
    { name: 'value', value: animatedValue },
    { name: 'empty', value: max - animatedValue }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#888" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-72 relative flex flex-col items-center">
      <h2 className="text-lg font-medium text-gray-800 mb-4">{title}</h2>
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              isAnimationActive={false}
            >
              <Cell key="value" fill={getColor(percentage)} />
              <Cell key="empty" fill="#EEF0F3" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute w-full text-center bottom-5">
          <div className="text-3xl font-bold text-gray-800">{animatedValue.toFixed(0)}</div>
          <div className="text-sm text-gray-500">out of {max}</div>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;