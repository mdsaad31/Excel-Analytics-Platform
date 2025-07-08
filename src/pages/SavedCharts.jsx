import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart, Treemap, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../data/mockData';
import api from '../config/api';
import { saveAs } from 'file-saver';

const SavedCharts = () => {
  const { currentUser } = useAuth();
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const chartTypeOptions = [
    { value: 'all', label: 'All Charts' },
    { value: 'bar', label: 'Bar Charts' },
    { value: 'line', label: 'Line Charts' },
    { value: 'area', label: 'Area Charts' },
    { value: 'pie', label: 'Pie Charts' },
    { value: 'radar', label: 'Radar Charts' },
    { value: 'scatter', label: 'Scatter Charts' },
    { value: 'treemap', label: 'Tree Maps' },
    { value: 'composed', label: 'Composed Charts' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'chartType', label: 'Chart Type' }
  ];

  useEffect(() => {
    if (currentUser?.sub) {
      fetchCharts();
      fetchStats();
    }
  }, [currentUser, filter, sortBy, sortOrder, currentPage]);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${api.API_BASE_URL}/saved-charts/${currentUser.sub}?page=${currentPage}&chartType=${filter}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=12`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch charts');
      }

      const data = await response.json();
      setCharts(data.charts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/saved-charts/stats/${currentUser.sub}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const deleteChart = async (chartId) => {
    if (!confirm('Are you sure you want to delete this chart?')) {
      return;
    }

    try {
      const response = await fetch(`${api.API_BASE_URL}/saved-charts/${chartId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCharts(charts.filter(chart => chart._id !== chartId));
        fetchStats(); // Refresh stats
      } else {
        throw new Error('Failed to delete chart');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadChart = async (chartId, title, format = 'png') => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/saved-charts/chart/${chartId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const chartData = await response.json();
      
      if (chartData.chartImageData) {
        // Convert base64 to blob and download
        const base64Data = chartData.chartImageData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${format}` });
        
        saveAs(blob, `${title}.${format}`);
      } else {
        throw new Error('No image data available for this chart');
      }
    } catch (err) {
      setError(`Failed to download chart: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChartTypeIcon = (type) => {
    const icons = {
      bar: '📊',
      line: '📈',
      area: '📉',
      pie: '🥧',
      radar: '🎯',
      scatter: '⚫',
      treemap: '🌳',
      composed: '📋'
    };
    return icons[type] || '📊';
  };

  const renderChart = (chart) => {
    const { chartConfig } = chart;
    if (!chartConfig) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
          <div className="text-center">
            <span className="text-4xl mb-2 block">{getChartTypeIcon(chart.chartType)}</span>
            <p>Chart configuration missing</p>
          </div>
        </div>
      );
    }

    const { chartData, xAxis, yAxis, colors = COLORS } = chartConfig;

    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
          <div className="text-center">
            <span className="text-4xl mb-2 block">{getChartTypeIcon(chart.chartType)}</span>
            <p>No valid chart data available</p>
          </div>
        </div>
      );
    }

    if (!xAxis || !yAxis) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
          <div className="text-center">
            <span className="text-4xl mb-2 block">{getChartTypeIcon(chart.chartType)}</span>
            <p>Chart axis configuration missing</p>
          </div>
        </div>
      );
    }

    // Transform data to ensure it's in the right format for Recharts
    const transformedData = chartData.map((item, index) => {
      if (typeof item !== 'object' || item === null) {
        return {};
      }
      
      // Ensure the data has the required structure
      const transformed = { ...item };
      
      // Make sure xAxis data exists
      if (xAxis && !(xAxis in transformed)) {
        // Try common fallback keys
        transformed[xAxis] = transformed.name || transformed.label || transformed.category || `Item ${index + 1}`;
      }
      
      // Make sure yAxis data exists and is numeric
      const yAxes = Array.isArray(yAxis) ? yAxis : [yAxis];
      yAxes.forEach(axis => {
        if (!(axis in transformed)) {
          // Try common fallback keys
          transformed[axis] = transformed.value || transformed.amount || transformed.count || 0;
        } else {
          const value = parseFloat(transformed[axis]);
          transformed[axis] = isNaN(value) ? 0 : value;
        }
      });
      
      return transformed;
    }).filter(item => Object.keys(item).length > 0); // Remove empty objects

    if (transformedData.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
          <div className="text-center">
            <span className="text-4xl mb-2 block">{getChartTypeIcon(chart.chartType)}</span>
            <p>Unable to transform chart data</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: transformedData,
      margin: { top: 5, right: 20, left: 5, bottom: 5 }
    };

    switch (chart.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey={xAxis} 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {Array.isArray(yAxis) ? yAxis.map((axis, index) => (
                <Bar
                  key={axis}
                  dataKey={axis}
                  fill={colors[index % colors.length]}
                  name={axis}
                />
              )) : (
                <Bar dataKey={yAxis} fill={colors[0]} name={yAxis} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey={xAxis} 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {Array.isArray(yAxis) ? yAxis.map((axis, index) => (
                <Line
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={axis}
                  dot={{ r: 3 }}
                />
              )) : (
                <Line 
                  type="monotone" 
                  dataKey={yAxis} 
                  stroke={colors[0]} 
                  strokeWidth={2} 
                  name={yAxis}
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey={xAxis} 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {Array.isArray(yAxis) ? yAxis.map((axis, index) => (
                <Area
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  name={axis}
                  fillOpacity={0.6}
                />
              )) : (
                <Area 
                  type="monotone" 
                  dataKey={yAxis} 
                  stackId="1" 
                  stroke={colors[0]} 
                  fill={colors[0]} 
                  name={yAxis}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieDataKey = Array.isArray(yAxis) ? yAxis[0] : yAxis;
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey={pieDataKey}
                nameKey={xAxis}
              >
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={transformedData}>
              <PolarGrid />
              <PolarAngleAxis dataKey={xAxis} tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 8 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {Array.isArray(yAxis) ? yAxis.map((axis, index) => (
                <Radar
                  key={axis}
                  name={axis}
                  dataKey={axis}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.4}
                />
              )) : (
                <Radar 
                  name={yAxis} 
                  dataKey={yAxis} 
                  stroke={colors[0]} 
                  fill={colors[0]} 
                  fillOpacity={0.4} 
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        const scatterYAxis = Array.isArray(yAxis) ? yAxis[0] : yAxis;
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey={xAxis} 
                tick={{ fontSize: 10 }}
                name={xAxis}
              />
              <YAxis 
                dataKey={scatterYAxis} 
                tick={{ fontSize: 10 }}
                name={scatterYAxis}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  fontSize: '12px'
                }}
              />
              <Scatter 
                data={transformedData}
                fill={colors[0]} 
                name={`${xAxis} vs ${scatterYAxis}`}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        const treemapDataKey = Array.isArray(yAxis) ? yAxis[0] : yAxis;
        return (
          <ResponsiveContainer width="100%" height={200}>
            <Treemap
              data={transformedData}
              dataKey={treemapDataKey}
              ratio={4/3}
              stroke="#fff"
              fill={colors[0]}
              content={({ root, depth, x, y, width, height, index, name, value }) => (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: colors[index % colors.length],
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                  />
                  {width > 30 && height > 20 && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="10"
                    >
                      {name}
                    </text>
                  )}
                </g>
              )}
            />
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
            <div className="text-center">
              <span className="text-4xl mb-2 block">{getChartTypeIcon(chart.chartType)}</span>
              <p>Chart type not supported for preview</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading saved charts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Charts</h1>
          <p className="mt-2 text-gray-600">Manage and download your saved chart visualizations</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{stats.totalCharts}</h3>
                  <p className="text-sm text-gray-600">Total Charts</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-lg">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stats.chartTypeStats.length}
                  </h3>
                  <p className="text-sm text-gray-600">Chart Types Used</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-lg">⏰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stats.recentCharts.length}
                  </h3>
                  <p className="text-sm text-gray-600">Recent Charts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Chart Type
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {chartTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View
              </label>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Charts Display */}
        {charts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved charts</h3>
            <p className="text-gray-600 mb-6">
              Start creating visualizations in the Analysis page to see them here.
            </p>
            <a
              href="/analysis"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Analysis
            </a>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {charts.map((chart) => (
              <div key={chart._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Chart Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className="text-xl mr-2 flex-shrink-0">{getChartTypeIcon(chart.chartType)}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate" title={chart.title}>
                          {chart.title}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">{chart.chartType} Chart</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Metadata */}
                  <div className="space-y-1 text-xs text-gray-500">
                    <p><strong>File:</strong> {chart.fileName}</p>
                    <p><strong>Created:</strong> {formatDate(chart.createdAt)}</p>
                  </div>
                  
                  {/* Tags */}
                  {chart.tags && chart.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {chart.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chart Visualization */}
                <div className="p-4 bg-gray-50">
                  <div className="bg-white rounded border">
                    {renderChart(chart)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadChart(chart._id, chart.title, 'png')}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                      title="Download as PNG"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => deleteChart(chart._id)}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                      title="Delete Chart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {charts.map((chart) => (
              <div key={chart._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Chart Info */}
                    <div className="lg:w-1/3">
                      <div className="flex items-start mb-3">
                        <span className="text-2xl mr-3 flex-shrink-0">{getChartTypeIcon(chart.chartType)}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{chart.title}</h3>
                          <p className="text-sm text-gray-600 capitalize mb-2">{chart.chartType} Chart</p>
                          
                          <div className="space-y-1 text-sm text-gray-500">
                            <p><strong>File:</strong> {chart.fileName}</p>
                            <p><strong>Created:</strong> {formatDate(chart.createdAt)}</p>
                          </div>
                          
                          {/* Tags */}
                          {chart.tags && chart.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {chart.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => downloadChart(chart._id, chart.title, 'png')}
                          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                          title="Download as PNG"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => deleteChart(chart._id)}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                          title="Delete Chart"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Chart Visualization */}
                    <div className="lg:w-2/3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="bg-white rounded border">
                          {renderChart(chart)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {charts.length} of {pagination.total} charts
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-2 text-sm rounded-md ${
                  pagination.hasPrev
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.current} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-2 text-sm rounded-md ${
                  pagination.hasNext
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCharts;
