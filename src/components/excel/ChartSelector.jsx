import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart, Treemap, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../data/mockData';
import { exportChartAsPNG, exportChartAsPDF } from '../../utils/chartExport';
import SaveChartModal from '../charts/SaveChartModal';

const ChartSelector = ({ data, activeSheet }) => {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [startRow, setStartRow] = useState(1);
  const [endRow, setEndRow] = useState(50);
  const [showSaveModal, setShowSaveModal] = useState(false);


  const trackRef = useRef(null);
  const activeThumbRef = useRef(null);

  const sheetData = data?.sheets?.[activeSheet] || [];
  const headers = data?.headers?.[activeSheet] || [];

  const startRowRef = useRef(startRow);
  const endRowRef = useRef(endRow);
  const sheetDataLengthRef = useRef(sheetData.length);

  useEffect(() => { startRowRef.current = startRow; }, [startRow]);
  useEffect(() => { endRowRef.current = endRow; }, [endRow]);
  useEffect(() => { sheetDataLengthRef.current = sheetData.length; }, [sheetData.length]);

  const handleMouseMove = useCallback((e) => {
    console.log('handleMouseMove: activeThumbRef.current', activeThumbRef.current, 'trackRef.current', trackRef.current);
    if (!activeThumbRef.current || !trackRef.current) {
      return;
    }

    const trackRect = trackRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    let newPercentage = (mouseX - trackRect.left) / trackRect.width;
    newPercentage = Math.max(0, Math.min(1, newPercentage));

    const totalRows = sheetDataLengthRef.current;
    let newRow;

    if (totalRows <= 1) {
      newRow = 1;
    } else {
      newRow = Math.round(newPercentage * (totalRows - 1)) + 1;
    }

    if (activeThumbRef.current === 'start') {
      setStartRow(Math.min(newRow, endRowRef.current));
    } else if (activeThumbRef.current === 'end') {
      setEndRow(Math.max(newRow, startRowRef.current));
    }
  }, [setStartRow, setEndRow, trackRef]);

  const handleMouseUp = useCallback(() => {
    console.log('handleMouseUp');
    activeThumbRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e, thumb) => {
    console.log('handleMouseDown: thumb', thumb, 'e.clientX', e.clientX);
    e.preventDefault();
    activeThumbRef.current = thumb;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  const handleTouchMove = useCallback((e) => {
    console.log('handleTouchMove: activeThumbRef.current', activeThumbRef.current, 'trackRef.current', trackRef.current);
    if (!activeThumbRef.current || !trackRef.current) {
      return;
    }

    const trackRect = trackRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX;
    let newPercentage = (touchX - trackRect.left) / trackRect.width;
    newPercentage = Math.max(0, Math.min(1, newPercentage));

    const totalRows = sheetDataLengthRef.current;
    let newRow;

    if (totalRows <= 1) {
      newRow = 1;
    } else {
      newRow = Math.round(newPercentage * (totalRows - 1)) + 1;
    }

    if (activeThumbRef.current === 'start') {
      setStartRow(Math.min(newRow, endRowRef.current));
    } else if (activeThumbRef.current === 'end') {
      setEndRow(Math.max(newRow, startRowRef.current));
    }
  }, [setStartRow, setEndRow, trackRef]);

  const handleTouchEnd = useCallback(() => {
    console.log('handleTouchEnd');
    activeThumbRef.current = null;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  const handleTouchStart = useCallback((e, thumb) => {
    console.log('handleTouchStart: thumb', thumb, 'e.touches[0].clientX', e.touches[0].clientX);
    e.preventDefault();
    activeThumbRef.current = thumb;
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove, handleTouchEnd]);
  
  // sheetData and headers are now defined earlier
  // const sheetData = data?.sheets?.[activeSheet] || [];
  // const headers = data?.headers?.[activeSheet] || [];
  
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

    if (sheetData.length > 0) {
      setEndRow(prevEndRow => Math.min(prevEndRow, sheetData.length));
    } else {
      setEndRow(1);
    }

    setStartRow(prevStartRow => Math.min(prevStartRow, endRow || 1));
    setStartRow(prevStartRow => Math.max(1, prevStartRow));

  }, [activeSheet, data, sheetData.length, endRow]);
  
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
    
    const actualStartRow = Math.max(0, startRow - 1);
    const actualEndRow = Math.min(sheetData.length, endRow);

    if (actualStartRow >= actualEndRow) {
      setChartData([]);
      return;
    }

    setChartData(preparedData.slice(actualStartRow, actualEndRow));
  }, [xAxis, yAxis, sheetData, activeSheet, startRow, endRow]);
  
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
          <ResponsiveContainer width="100%" height={600}>
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
          <ResponsiveContainer width="100%" height={600}>
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
          <ResponsiveContainer width="100%" height={600}>
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
          <ResponsiveContainer width="100%" height={600}>
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
          <ResponsiveContainer width="100%" height={600}>
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
          <ResponsiveContainer width="100%" height={600}>
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
        
      case 'bubble':
        if (yAxis.length < 3) {
          return (
            <div className="text-amber-600 text-center p-4 bg-amber-50 rounded">
              Bubble chart requires at least 3 Y-axis selections (X, Y, and Size)
            </div>
          );
        }
        
        const bubbleData = chartData.map(item => ({
          x: parseFloat(item[yAxis[0]]) || 0,
          y: parseFloat(item[yAxis[1]]) || 0,
          z: parseFloat(item[yAxis[2]]) || 0,
          name: item.name || 'Unknown',
        }));
        
        return (
          <ResponsiveContainer width="100%" height={600}>
            <ScatterChart data={bubbleData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name={yAxis[0]} />
              <YAxis type="number" dataKey="y" name={yAxis[1]} />
              <ZAxis type="number" dataKey="z" name={yAxis[2]} range={[60, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, x, y, z } = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
                        <p className="font-medium">{name}</p>
                        <p className="text-sm">{yAxis[0]}: {x}</p>
                        <p className="text-sm">{yAxis[1]}: {y}</p>
                        <p className="text-sm">{yAxis[2]}: {z}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Scatter name="Data Points" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case 'gauge':
        if (yAxis.length === 0) {
          return (
            <div className="text-amber-600 text-center p-4 bg-amber-50 rounded">
              Gauge chart requires at least 1 Y-axis selection
            </div>
          );
        }
        
        const gaugeValue = chartData.reduce((sum, item) => sum + (parseFloat(item[yAxis[0]]) || 0), 0) / chartData.length;
        const maxVal = Math.max(...chartData.map(item => parseFloat(item[yAxis[0]]) || 0));
        
        const gaugeData = [
          { name: 'value', value: gaugeValue },
          { name: 'empty', value: maxVal - gaugeValue }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={600}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#8884d8" />
                <Cell fill="#e0e0e0" />
              </Pie>
              <Tooltip />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
                {gaugeValue.toFixed(1)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'treemap':
        if (yAxis.length === 0) {
          return (
            <div className="text-amber-600 text-center p-4 bg-amber-50 rounded">
              Tree map requires at least 1 Y-axis selection
            </div>
          );
        }
        
        const treemapData = chartData.map((item, index) => ({
          name: item.name || `Item ${index + 1}`,
          value: parseFloat(item[yAxis[0]]) || 0,
          fill: COLORS[index % COLORS.length]
        }));
        
        return (
          <ResponsiveContainer width="100%" height={600}>
            <Treemap
              data={treemapData}
              dataKey="value"
              ratio={4/3}
              stroke="#fff"
              strokeWidth={2}
              content={({ root, depth, x, y, width, height, index, name, value }) => {
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: treemapData[index]?.fill || '#8884d8',
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 1,
                      }}
                    />
                    {width > 60 && height > 40 && (
                      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
                        {name}
                      </text>
                    )}
                    {width > 60 && height > 60 && (
                      <text x={x + width / 2} y={y + height / 2 + 16} textAnchor="middle" fill="#fff" fontSize="12">
                        {value}
                      </text>
                    )}
                  </g>
                );
              }}
            />
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

  const handleSaveChart = () => {
    if (!chartData.length) {
      alert('No chart data to save. Please generate a chart first.');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveSuccess = (savedChart) => {
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    successMsg.textContent = 'Chart saved successfully!';
    document.body.appendChild(successMsg);
    setTimeout(() => document.body.removeChild(successMsg), 3000);
  };

  const getCurrentChartData = () => {
    const savedData = localStorage.getItem('lastExcelData');
    const fileName = savedData ? JSON.parse(savedData).fileName : 'Unknown File';
    
    return {
      chartType,
      xAxis,
      yAxis,
      chartData,
      colors: COLORS,
      startRow,
      endRow,
      activeSheet,
      fileName
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Chart Generator</h2>
          
          {chartData.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveChart}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                title="Save Chart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V5a1 1 0 10-2 0v7.586l-1.293-1.293z"/>
                  <path d="M5 3a2 2 0 00-2 2v1a1 1 0 002 0V5h8v10H5v-1a1 1 0 00-2 0v1a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H5z"/>
                </svg>
                Save
              </button>
              
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
              <option value="bubble">Bubble Chart</option>
              <option value="gauge">Gauge Chart</option>
              <option value="treemap">Tree Map</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis Category</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              disabled={['scatter', 'bubble', 'gauge', 'treemap'].includes(chartType)}
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
        
        <div className="mb-4">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
          >
            {showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </button>

          {showAdvancedSettings && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative pt-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Row Range: {startRow} - {endRow}</label>
                <div className="relative h-2 bg-gray-200 rounded-full" ref={trackRef}>
                  <div
                    className="absolute h-full bg-blue-500 rounded-full"
                    style={{
                      left: `${((startRow - 1) / (sheetData.length > 1 ? sheetData.length - 1 : 1)) * 100}%`,
                      width: `${((endRow - startRow) / (sheetData.length > 1 ? sheetData.length - 1 : 1)) * 100}%`,
                    }}
                  ></div>
                  {/* Start Thumb */}
                  <div
                    className="absolute w-5 h-5 bg-blue-700 rounded-full shadow-md cursor-pointer"
                    style={{
                      left: `${((startRow - 1) / (sheetData.length > 1 ? sheetData.length - 1 : 1)) * 100}%`,
                      transform: 'translateX(-50%)',
                      top: '-6px',
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling up
                      handleMouseDown(e, 'start');
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling up
                      handleTouchStart(e, 'start');
                    }}
                  ></div>
                  {/* End Thumb */}
                  <div
                    className="absolute w-5 h-5 bg-blue-700 rounded-full shadow-md cursor-pointer"
                    style={{
                      left: `${((endRow - 1) / (sheetData.length > 1 ? sheetData.length - 1 : 1)) * 100}%`,
                      transform: 'translateX(-50%)',
                      top: '-6px',
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling up
                      handleMouseDown(e, 'end');
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling up
                      handleTouchStart(e, 'end');
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div id="chart-container" ref={chartRef} className="border rounded-lg p-4 bg-gray-50 min-h-80 min-w-[700px]">
        {renderChart()}
        {chartData.length === 0 && (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Select columns to generate chart
          </div>
        )}
      </div>
      
      <SaveChartModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        chartData={getCurrentChartData()}
        onSaveSuccess={handleSaveSuccess}
      />
      
    </div>
  );
};

export default ChartSelector;