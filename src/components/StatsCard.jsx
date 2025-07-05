import React from 'react';

const StatsCard = ({ title, value, change, trend, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className={`p-2 rounded-full ${icon.bgColor}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={icon.path} 
            />
          </svg>
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <div className="flex items-center mt-2">
          <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={trend === 'up' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} 
              />
            </svg>
            {change}
          </span>
          <span className="text-xs text-gray-500 ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;