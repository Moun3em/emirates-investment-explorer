
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
  // First validate that we have actual data
  if (!portfolioHistory || !Array.isArray(portfolioHistory) || portfolioHistory.length === 0) {
    return <div className="p-4 text-center">No portfolio data available</div>;
  }

  // Safely process data for the chart
  let chartData: ChartDataPoint[] = [];
  try {
    chartData = portfolioHistory.map(snapshot => {
      // Ensure all numeric values are finite numbers, defaulting to 0 if not
      return {
        name: `Day ${snapshot.day}`,
        value: isFinite(snapshot.totalValue) ? snapshot.totalValue : 0,
        cash: isFinite(snapshot.cash) ? snapshot.cash : 0,
        stocks: isFinite(snapshot.holdingsValue) ? snapshot.holdingsValue : 0,
        change: isFinite(snapshot.percentChange || 0) ? (snapshot.percentChange || 0) : 0
      };
    }).filter(point => 
      // Additional filter to ensure all required numeric properties exist and are valid
      isFinite(point.value) && isFinite(point.cash) && isFinite(point.stocks)
    );
  } catch (error) {
    console.error("Error processing portfolio chart data:", error);
    return <div className="p-4 text-center">Error processing portfolio data</div>;
  }

  // Safety check to prevent invalid array length errors
  if (chartData.length === 0) {
    return <div className="p-4 text-center">No valid portfolio data available for charting</div>;
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
          <YAxis 
            tickFormatter={(value) => `${value.toFixed(0)}`}
            domain={['auto', 'auto']} // Use auto domain to prevent NaN issues
          />
          <Tooltip 
            formatter={(value: number) => {
              return isFinite(value) ? [`AED ${value.toFixed(2)}`, ''] : ['N/A', ''];
            }}
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
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="stocks" 
            name="Stocks" 
            stackId="1"
            stroke="#7E69AB" 
            fill="url(#stocksGradient)" 
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Total Value" 
            stroke="#33C3F0"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
