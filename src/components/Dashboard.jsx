import React from 'react';
import AreaChartComponent from './charts/AreaChart';
import BarChartComponent from './charts/BarChart';
import PieChartComponent from './charts/PieChart';
import LineChartComponent from './charts/LineChart';
import RadarChartComponent from './charts/RadarChart';
import GaugeChart from './charts/GaugeChart';
import BubbleChart from './charts/BubbleChart';
import TreeMapChart from './charts/TreeMap';
import StatsCard from './StatsCard';
import { mockStats } from '../data/mockData';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Revenue Trends</h2>
          <AreaChartComponent />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Monthly Sales</h2>
          <BarChartComponent />
        </div>
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Traffic Sources</h2>
          <PieChartComponent />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Conversion Rate</h2>
          <LineChartComponent />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Performance Metrics</h2>
          <RadarChartComponent />
        </div>
      </div>
      
      {/* Charts - Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <GaugeChart value={72} min={0} max={100} title="System Utilization" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <BubbleChart />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <TreeMapChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;