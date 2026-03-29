import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot
} from 'recharts';
import { format } from 'date-fns';

const WeightChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">No weight data available to display</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(record => ({
    displayDate: format(new Date(record.checkupDate), 'MM/yyyy'),
    weight: record.weight,
    rawDate: new Date(record.checkupDate)
  })).sort((a, b) => a.rawDate - b.rawDate);

  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Weight Monitoring (kg)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            label={{ value: 'kg', angle: -90, position: 'insideLeft', offset: 10, fill: '#9ca3af' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#ff4d4d"
            strokeWidth={3}
            dot={{ r: 6, fill: '#ff4d4d', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, strokeWidth: 0 }}
            animationDuration={1500}
            name="Weight"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
