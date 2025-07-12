import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart, Treemap, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../data/mockData';
import api from '../config/api';
import { saveAs } from 'file-saver';
import UserProfileModal from '../components/explore/UserProfileModal';

const Explore = () => {
  const { currentUser } = useAuth();
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

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
    { value: 'chartType', label: 'Chart Type' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'downloads', label: 'Most Downloaded' }
  ];

  useEffect(() => {
    fetchPublicCharts();
  }, [filter, sortBy, sortOrder, currentPage, search]);

  const fetchPublicCharts = async () => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(
        `${api.API_BASE_URL}/saved-charts/public/explore?page=${currentPage}&chartType=${filter}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=12${searchParam}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch public charts');
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

  const toggleLike = async (chartId) => {
    if (!currentUser?.sub) {
      alert('Please log in to like charts');
      return;
    }

    try {
      const response = await fetch(`${api.API_BASE_URL}/saved-charts/${chartId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.sub }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      setCharts(prevCharts => 
        prevCharts.map(chart => 
          chart._id === chartId 
            ? { 
                ...chart, 
                likes: data.liked 
                  ? [...(chart.likes || []), currentUser.sub]
                  : (chart.likes || []).filter(id => id !== currentUser.sub)
              }
            : chart
        )
      );
    } catch (err) {
      setError(`Failed to ${getIsLiked(charts.find(c => c._id === chartId)) ? 'unlike' : 'like'} chart: ${err.message}`);
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
        const base64Data = chartData.chartImageData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${format}` });
        
        saveAs(blob, `${title}.${format}`);
        
        setCharts(prevCharts => 
          prevCharts.map(chart => 
            chart._id === chartId 
              ? { ...chart, downloads: (chart.downloads || 0) + 1 }
              : chart
          )
        );
      } else {
        throw new Error('No image data available for this chart');
      }
    } catch (err) {
      setError(`Failed to download chart: ${err.message}`);
    }
  };

  const handleUserClick = (userProfile) => {
    setSelectedUser(userProfile);
    setShowUserModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPublicCharts();
  };

  const getIsLiked = (chart) => {
    return chart?.likes?.includes(currentUser?.sub) || false;
  };

  const getLikesCount = (chart) => {
    return chart?.likes?.length || 0;
  };

  const getDownloadsCount = (chart) => {
    return chart?.downloads || 0;
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

  const parseAvatar = (avatarString) => {
    if (!avatarString) return { emoji: '💻', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    const [emoji, gradient] = avatarString.split('|');
    return { emoji, gradient };
  };

  const AvatarDisplay = ({ avatar, size = 'w-8 h-8' }) => {
    const { emoji, gradient } = parseAvatar(avatar);
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform`}
        style={{ 
          background: gradient,
          fontSize: size.includes('w-12') ? '20px' : 
                    size.includes('w-10') ? '18px' :
                    size.includes('w-8') ? '14px' : '12px'
        }}
      >
        {emoji}
      </div>
    );
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

    const transformedData = chartData.map((item, index) => {
      if (typeof item !== 'object' || item === null) {
        return {};
      }
      
      const transformed = { ...item };
      
      if (xAxis && !(xAxis in transformed)) {
        transformed[xAxis] = transformed.name || transformed.label || transformed.category || `Item ${index + 1}`;
      }
      
      const yAxes = Array.isArray(yAxis) ? yAxis : [yAxis];
      yAxes.forEach(axis => {
        if (!(axis in transformed)) {
          transformed[axis] = transformed.value || transformed.amount || transformed.count || 0;
        } else {
          const value = parseFloat(transformed[axis]);
          transformed[axis] = isNaN(value) ? 0 : value;
        }
      });
      
      return transformed;
    }).filter(item => Object.keys(item).length > 0);

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
          <p className="mt-4 text-gray-600">Loading public charts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Charts</h1>
          <p className="mt-2 text-gray-600">Discover and download amazing charts created by the community</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search charts by title or tags..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Chart Type Filter */}
            <div>
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

            {/* Sort By */}
            <div>
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

            {/* Sort Order */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
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
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No public charts found</h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try adjusting your search terms or filters.' : 'No public charts are available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {charts.map((chart) => (
              <div key={chart._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Chart Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
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
                  
                  {/* Creator Info */}
                  <div 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => handleUserClick(chart.user)}
                  >
                    <AvatarDisplay avatar={chart.user?.avatar} size="w-10 h-10" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{chart.user?.nickname || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500 truncate">{chart.user?.bio || 'No bio available'}</p>
                      {/* User Skills */}
                      {chart.user?.skills && chart.user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chart.user.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {chart.user.skills.length > 3 && (
                            <span className="text-xs text-gray-400">+{chart.user.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Chart Metadata */}
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p><strong>Created:</strong> {formatDate(chart.createdAt)}</p>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        ❤️ {getLikesCount(chart)}
                      </span>
                      <span className="flex items-center">
                        ⬇️ {getDownloadsCount(chart)}
                      </span>
                    </div>
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
                      onClick={() => toggleLike(chart._id)}
                      className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center ${
                        getIsLiked(chart)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={getIsLiked(chart) ? 'Unlike' : 'Like'}
                    >
                      <span className="mr-1">{getIsLiked(chart) ? '❤️' : '🤍'}</span>
                      {getLikesCount(chart)}
                    </button>
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

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default Explore;
