import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../data/mockData';

const ChartSelector = ({ data, activeSheet }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  const sheetData = data?.sheets?.[activeSheet] || [];
  const headers = data?.headers?.[activeSheet] || [];
  
  const numericColumns = headers.filter(header => {
    if (sheetData.length === 0) return false;
    const value = sheetData[0][header];
    return !isNaN(parseFloat(value)) && isFinite(value);
  });
  
  const categoricalColumns = headers.filter(header => 
    !numericColumns.includes(header)
  );
  
  useEffect(() => {
    if (categoricalColumns.length > 0) {
      setXAxis(categoricalColumns[0]);
    }
    
    if (numericColumns.length > 0) {
      setYAxis([numericColumns[0]]);
    }
  }, [activeSheet, data]);
  
  useEffect(() => {
    if (!xAxis || yAxis.length === 0 || !sheetData.length) {
      setChartData([]);
      return;
    }
    
    const preparedData = sheetData.map(row => {
      const dataPoint = { name: row[xAxis] };
      
      yAxis.forEach(col => {
        const value = parseFloat(row[col]);
        dataPoint[col] = isNaN(value) ? 0 : value;
      });
      
      return dataPoint;
    });
    
    setChartData(preparedData.slice(0, 50));
  }, [xAxis, yAxis, sheetData, activeSheet]);
  
  const handleYAxisChange = (column, isChecked) => {
    if (isChecked) {
      setYAxis(prev => [...prev, column]);
    } else {
      setYAxis(prev => prev.filter(col => col !== column));
    }
  };
  
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        No data available for visualization. Please upload an Excel file.
      </div>
    );
  }
  
  const renderChart = () => {
    if (!chartData.length) return null;
    
    switch(chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yAxis.map((axis, index) => (
                <Bar key={axis} dataKey={axis} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yAxis.map((axis, index) => (
                <Line 
                  key={axis} 
                  type="monotone" 
                  dataKey={axis} 
                  stroke={COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yAxis.map((axis, index) => (
                <Area 
                  key={axis} 
                  type="monotone" 
                  dataKey={axis} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        if (yAxis.length === 0) return null;
        
        const pieData = yAxis.map(axis => ({
          name: axis,
          value: chartData.reduce((sum, item) => sum + (parseFloat(item[axis]) || 0), 0)
        }));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'radar':
        if (yAxis.length === 0) return null;
        
        const radarData = chartData.slice(0, 8).map(item => {
          const dataPoint = { name: item.name };
          yAxis.forEach(axis => {
            dataPoint[axis] = item[axis] || 0;
          });
          return dataPoint;
        });
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              {yAxis.map((axis, index) => (
                <Radar
                  key={axis}
                  name={axis}
                  dataKey={axis}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        if (yAxis.length < 2) {
          return (
            <div className="text-amber-600 text-center p-4 bg-amber-50 rounded">
              Scatter plot requires at least 2 Y-axis selections
            </div>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={yAxis[0]} type="number" name={yAxis[0]} />
              <YAxis dataKey={yAxis[1]} type="number" name={yAxis[1]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={`${yAxis[0]} vs ${yAxis[1]}`} fill="#8884d8" />
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Chart Generator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="radar">Radar Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis Category</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              disabled={chartType === 'scatter'}
            >
              {categoricalColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis Values</label>
            <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
              {numericColumns.map(col => (
                <div key={col} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`y-axis-${col}`}
                    checked={yAxis.includes(col)}
                    onChange={(e) => handleYAxisChange(col, e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`y-axis-${col}`} className="text-sm">{col}</label>
                </div>
              ))}
              {numericColumns.length === 0 && (
                <p className="text-sm text-gray-500">No numeric columns found</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-gray-50 min-h-80">
        {renderChart()}
        {chartData.length === 0 && (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Select columns to generate chart
          </div>
        )}
      </div>
      
      {chartData.length > 0 && chartData.length < sheetData.length && (
        <p className="text-xs text-gray-500 mt-2">
          Note: Chart shows first 50 rows for performance
        </p>
      )}
    </div>
  );
};

export default ChartSelector;