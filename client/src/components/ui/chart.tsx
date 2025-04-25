import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Common chart props
interface ChartProps {
  data: ChartData<any, any[], any>;
  options?: ChartOptions<any>;
  height?: number;
  width?: number;
  className?: string;
}

// Colors for charts
export const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#6366F1', // primary-600
  '#10B981', // green-500
  '#F97316', // orange-500
  '#3B82F6', // blue-500
  '#8B5CF6', // purple-500
];

// Default chart options
const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        boxWidth: 12,
      },
    },
    tooltip: {
      enabled: true,
    },
  },
};

export function DoughnutChart({ 
  data, 
  options = {}, 
  height,
  width,
  className = '',
}: ChartProps) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    cutout: '70%',
  };

  return (
    <div className={className}>
      <Doughnut data={data} options={mergedOptions} height={height} width={width} />
    </div>
  );
}

export function PieChart({ 
  data, 
  options = {}, 
  height,
  width,
  className = '',
}: ChartProps) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  return (
    <div className={className}>
      <Pie data={data} options={mergedOptions} height={height} width={width} />
    </div>
  );
}

export function BarChart({ 
  data, 
  options = {}, 
  height,
  width,
  className = '',
}: ChartProps) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  return (
    <div className={className}>
      <Bar data={data} options={mergedOptions} height={height} width={width} />
    </div>
  );
}
