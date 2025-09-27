'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface ChartData {
  date: string;
  sent: number;
  received: number;
  delivered: number;
  read: number;
}

interface MessageVolumeChartsProps {
  data?: ChartData[];
  timeRange?: 'daily' | 'weekly' | 'monthly';
  onTimeRangeChange?: (range: 'daily' | 'weekly' | 'monthly') => void;
}

// Mock data for demonstration
const mockDailyData: ChartData[] = [
  { date: '2024-01-15', sent: 45, received: 32, delivered: 43, read: 38 },
  { date: '2024-01-16', sent: 52, received: 28, delivered: 50, read: 45 },
  { date: '2024-01-17', sent: 38, received: 41, delivered: 36, read: 32 },
  { date: '2024-01-18', sent: 67, received: 35, delivered: 65, read: 58 },
  { date: '2024-01-19', sent: 71, received: 42, delivered: 69, read: 63 },
  { date: '2024-01-20', sent: 59, received: 38, delivered: 57, read: 51 },
  { date: '2024-01-21', sent: 48, received: 29, delivered: 46, read: 41 }
];

const mockWeeklyData: ChartData[] = [
  { date: 'Week 1', sent: 320, received: 245, delivered: 310, read: 285 },
  { date: 'Week 2', sent: 385, received: 298, delivered: 375, read: 342 },
  { date: 'Week 3', sent: 412, received: 315, delivered: 398, read: 365 },
  { date: 'Week 4', sent: 378, received: 289, delivered: 365, read: 331 }
];

const mockMonthlyData: ChartData[] = [
  { date: 'Oct 2023', sent: 1245, received: 987, delivered: 1198, read: 1089 },
  { date: 'Nov 2023', sent: 1389, received: 1102, delivered: 1345, read: 1234 },
  { date: 'Dec 2023', sent: 1567, received: 1234, delivered: 1523, read: 1398 },
  { date: 'Jan 2024', sent: 1495, received: 1189, delivered: 1456, read: 1323 }
];

export default function MessageVolumeCharts({ 
  data, 
  timeRange = 'daily', 
  onTimeRangeChange 
}: MessageVolumeChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'sent' | 'received' | 'delivered' | 'read'>('sent');

  const getChartData = () => {
    if (data) return data;
    
    switch (timeRange) {
      case 'weekly':
        return mockWeeklyData;
      case 'monthly':
        return mockMonthlyData;
      default:
        return mockDailyData;
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => Math.max(d.sent, d.received, d.delivered, d.read)));

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 200; // 200px max height
  };

  const formatDate = (date: string) => {
    if (timeRange === 'weekly' || timeRange === 'monthly') {
      return date;
    }
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateTrend = () => {
    if (chartData.length < 2) return { value: 0, direction: 'neutral' };
    
    const current = chartData[chartData.length - 1][selectedMetric];
    const previous = chartData[chartData.length - 2][selectedMetric];
    const change = ((current - previous) / previous) * 100;
    
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const trend = calculateTrend();

  const metrics = [
    { key: 'sent', label: 'Sent', color: 'bg-blue-500', lightColor: 'bg-blue-100' },
    { key: 'received', label: 'Received', color: 'bg-green-500', lightColor: 'bg-green-100' },
    { key: 'delivered', label: 'Delivered', color: 'bg-yellow-500', lightColor: 'bg-yellow-100' },
    { key: 'read', label: 'Read', color: 'bg-purple-500', lightColor: 'bg-purple-100' }
  ];

  const currentMetric = metrics.find(m => m.key === selectedMetric);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Message Volume</h3>
              <p className="text-sm text-gray-500">Track message statistics over time</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange?.(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex space-x-2 mt-4">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric.key
                  ? `${metric.lightColor} text-gray-900 border border-gray-300`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
              <span>{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => {
            const total = chartData.reduce((sum, d) => sum + d[metric.key as keyof ChartData] as number, 0);
            const average = Math.round(total / chartData.length);
            
            return (
              <div key={metric.key} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${metric.color} mx-auto mb-2`}></div>
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
                <div className="text-xs text-gray-500">Avg: {average}</div>
              </div>
            );
          })}
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Trend:</span>
            {trend.direction === 'up' && (
              <>
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">+{trend.value.toFixed(1)}%</span>
              </>
            )}
            {trend.direction === 'down' && (
              <>
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">-{trend.value.toFixed(1)}%</span>
              </>
            )}
            {trend.direction === 'neutral' && (
              <span className="text-sm font-medium text-gray-600">No change</span>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative">
          <div className="flex items-end justify-between space-x-2 h-64">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <div className="relative w-full max-w-12 mb-2">
                  <div
                    className={`w-full ${currentMetric?.color} rounded-t-md transition-all duration-300 hover:opacity-80`}
                    style={{ height: `${getBarHeight(item[selectedMetric])}px` }}
                  ></div>
                  
                  {/* Value Label */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                    {item[selectedMetric]}
                  </div>
                </div>
                
                {/* Date Label */}
                <div className="text-xs text-gray-500 text-center">
                  {formatDate(item.date)}
                </div>
              </div>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-6">
            {metrics.map((metric) => (
              <div key={metric.key} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
