import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Chart from 'chart.js/auto';

interface ChartProps {
  type: 'doughnut' | 'bar';
  labels: string[];
  data: number[];
  title?: string;
}

export function ChartComponent({ type, labels, data, title }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<'doughnut' | 'bar'> | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create color palette based on the primary color
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstanceRef.current = new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: type === 'doughnut',
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
              }
            },
            title: {
              display: !!title,
              text: title || '',
              font: {
                size: 16,
                weight: 'bold'
              }
            }
          },
          ...(type === 'doughnut' ? {
            cutout: '70%'
          } : {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `${value}%`
                }
              }
            }
          })
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [type, labels, data, title]);

  return (
    <div className="chart-container w-full max-w-md mx-auto">
      <canvas ref={chartRef} width={300} height={300}></canvas>
    </div>
  );
}

interface ResultsChartProps {
  labels: string[];
  data: number[];
}

export function DoughnutChart({ labels, data }: ResultsChartProps) {
  return <ChartComponent type="doughnut" labels={labels} data={data} />;
}

export function BarChart({ labels, data }: ResultsChartProps) {
  return <ChartComponent type="bar" labels={labels} data={data} />;
}
