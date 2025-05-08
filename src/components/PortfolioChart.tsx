
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { PortfolioSnapshot } from '@/types/game.types';

interface PortfolioChartProps {
  portfolioHistory: PortfolioSnapshot[];
}

interface ChartDataPoint {
  name: string;
  value: number;
  cash: number;
  stocks: number;
  change?: number;
}

const PortfolioChart = ({ portfolioHistory }: PortfolioChartProps) => {
  if (!portfolioHistory || portfolioHistory.length === 0) {
    return <div>No portfolio data available</div>;
  }

  // Make sure we have valid data for our chart
  const chartData: ChartDataPoint[] = portfolioHistory.map(snapshot => ({
    name: `Day ${snapshot.day}`,
    value: isFinite(snapshot.totalValue) ? snapshot.totalValue : 0,
    cash: isFinite(snapshot.cash) ? snapshot.cash : 0,
    stocks: isFinite(snapshot.holdingsValue) ? snapshot.holdingsValue : 0,
    change: isFinite(snapshot.percentChange || 0) ? (snapshot.percentChange || 0) : 0
  }));

  // Safety check to prevent invalid array length errors
  if (chartData.length === 0) {
    return <div>No valid portfolio data available for charting</div>;
  }

  return (
    <div className="w-full h-80 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Portfolio Value</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `${value.toFixed(0)}`} />
          <Tooltip 
            formatter={(value: number) => [`AED ${value.toFixed(2)}`, '']}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <defs>
            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FEF7CD" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FEF7CD" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="stocksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#33C3F0" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#33C3F0" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="cash" 
            name="Cash" 
            stackId="1"
            stroke="#E2CD42" 
            fill="url(#cashGradient)" 
          />
          <Area 
            type="monotone" 
            dataKey="stocks" 
            name="Stocks" 
            stackId="1"
            stroke="#7E69AB" 
            fill="url(#stocksGradient)" 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Total Value" 
            stroke="#33C3F0"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
