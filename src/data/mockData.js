// Mock data for all charts

// Area Chart Data
export const areaChartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 2000, profit: 9800 },
  { name: 'Apr', revenue: 2780, profit: 3908 },
  { name: 'May', revenue: 1890, profit: 4800 },
  { name: 'Jun', revenue: 2390, profit: 3800 },
  { name: 'Jul', revenue: 3490, profit: 4300 },
  { name: 'Aug', revenue: 4000, profit: 2400 },
  { name: 'Sep', revenue: 3000, profit: 1398 },
  { name: 'Oct', revenue: 2000, profit: 9800 },
  { name: 'Nov', revenue: 2780, profit: 3908 },
  { name: 'Dec', revenue: 1890, profit: 4800 },
];

// Bar Chart Data
export const barChartData = [
  { name: 'Jan', online: 4000, inStore: 2400 },
  { name: 'Feb', online: 3000, inStore: 1398 },
  { name: 'Mar', online: 2000, inStore: 5800 },
  { name: 'Apr', online: 2780, inStore: 3908 },
  { name: 'May', online: 1890, inStore: 4800 },
  { name: 'Jun', online: 2390, inStore: 3800 },
];

// Pie Chart Data
export const pieChartData = [
  { name: 'Organic', value: 400 },
  { name: 'Direct', value: 300 },
  { name: 'Referral', value: 300 },
  { name: 'Social', value: 200 },
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Line Chart Data
export const lineChartData = [
  { name: 'Jan', visits: 4000, conversions: 240 },
  { name: 'Feb', visits: 3000, conversions: 139 },
  { name: 'Mar', visits: 2000, conversions: 980 },
  { name: 'Apr', visits: 2780, conversions: 390 },
  { name: 'May', visits: 1890, conversions: 480 },
  { name: 'Jun', visits: 2390, conversions: 380 },
];

// Radar Chart Data
export const radarChartData = [
  { subject: 'Speed', A: 80, B: 60 },
  { subject: 'Quality', A: 95, B: 90 },
  { subject: 'Support', A: 50, B: 85 },
  { subject: 'Features', A: 85, B: 65 },
  { subject: 'UX', A: 90, B: 79 },
  { subject: 'Stability', A: 70, B: 60 },
];

// Stats Cards Data
export const mockStats = [
  {
    title: 'Total Revenue',
    value: '$54,385',
    change: '+14.5%',
    trend: 'up',
    icon: {
      path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-indigo-500'
    }
  },
  {
    title: 'New Users',
    value: '8,549',
    change: '+5.25%',
    trend: 'up',
    icon: {
      path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      bgColor: 'bg-green-500'
    }
  },
  {
    title: 'Engagement',
    value: '87.5%',
    change: '-2.35%',
    trend: 'down',
    icon: {
      path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      bgColor: 'bg-blue-500'
    }
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '+1.2%',
    trend: 'up',
    icon: {
      path: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      bgColor: 'bg-purple-500'
    }
  }
];