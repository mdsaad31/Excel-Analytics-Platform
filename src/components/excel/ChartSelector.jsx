import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../data/mockData';
import { exportChartAsPNG, exportChartAsPDF } from '../../utils/chartExport';

const ChartSelector = ({ data, activeSheet }) => {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  
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
  
  const handleExportPNG = async () => {
    if (!chartData.length) {
      alert('No chart data to export. Please generate a chart first.');
      return;
    }

    setIsExporting(true);
    try {
      const fileName = `${activeSheet}-${chartType}-chart`;
      await exportChartAsPNG('chart-container', fileName);
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      successMsg.textContent = 'Chart exported as PNG successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export chart as PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!chartData.length) {
      alert('No chart data to export. Please generate a chart first.');
      return;
    }

    setIsExporting(true);
    try {
      const fileName = `${activeSheet}-${chartType}-chart`;
      const title = `${activeSheet} ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`;
      await exportChartAsPDF('chart-container', fileName, { title });
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      successMsg.textContent = 'Chart exported as PDF successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export chart as PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Chart Generator</h2>
          
          {chartData.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as PNG"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {isExporting ? 'Exporting...' : 'PNG'}
              </button>
              
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                {isExporting ? 'Exporting...' : 'PDF'}
              </button>
            </div>
          )}
        </div>
        
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
      
      <div id="chart-container" ref={chartRef} className="border rounded-lg p-4 bg-gray-50 min-h-80">
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