import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

// Mock data for contract activity (e.g., inheritances created/claimed per month)
const contractActivityData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Inheritances Created',
      data: [5, 8, 6, 10, 12, 9, 14],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Inheritances Claimed',
      data: [2, 4, 3, 6, 7, 5, 8],
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

// Mock data for inheritance status distribution
const inheritanceStatusData = {
  labels: ['Active', 'Claimed', 'Expired'],
  datasets: [
    {
      label: 'Status',
      data: [60, 25, 15],
      backgroundColor: [
        'rgba(37,99,235,0.7)', // blue
        'rgba(22,163,74,0.7)', // green
        'rgba(239,68,68,0.7)', // red
      ],
      borderWidth: 1,
    },
  ],
};

export default function DashboardAnalytics() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Line Chart: Contract Activity */}
      <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Contract Activity (Last 7 Months)</h3>
        <Line data={contractActivityData} options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: { enabled: true },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 2 } },
          },
        }} />
      </div>
      {/* Pie Chart: Inheritance Status */}
      <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Inheritance Status Distribution</h3>
        <Pie data={inheritanceStatusData} options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: { enabled: true },
          },
        }} />
      </div>
    </div>
  );
} 