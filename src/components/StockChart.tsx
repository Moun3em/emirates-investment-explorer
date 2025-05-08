
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
  ReferenceDot
} from 'recharts';
import { PriceData, Transaction } from '@/types/game.types';

interface StockChartProps {
  companyId: string;
  currentDay: number;
  priceData: PriceData[];
  transactions?: Transaction[];
}

interface ChartDataPoint {
  name: string;
  price: number;
  buys?: number;
  sells?: number;
}

const StockChart = ({ companyId, currentDay, priceData, transactions = [] }: StockChartProps) => {
  const company = priceData.find(data => data.companyId === companyId);
  if (!company) return <div>No data available</div>;

  const chartData: ChartDataPoint[] = [];
  
  // Add price data points for days up to current day
  for (let i = 1; i <= currentDay; i++) {
    const price = getPrice(i);
    if (price !== null) {
      chartData.push({
        name: `Day ${i}`,
        price
      });
    }
  }
  
  // Add transaction markers
  transactions
    .filter(t => t.companyId === companyId && t.day <= currentDay)
    .forEach(transaction => {
      const dataPoint = chartData.find(point => point.name === `Day ${transaction.day}`);
      if (dataPoint) {
        if (transaction.type === 'buy') {
          dataPoint.buys = transaction.price;
        } else {
          dataPoint.sells = transaction.price;
        }
      }
    });

  function getPrice(day: number): number | null {
    switch (day) {
      case 1: return company.day1Price;
      case 2: return company.day2Price;
      case 3: return company.day3Price;
      case 4: return company.day4Price;
      case 5: return company.day5Price;
      default: return null;
    }
  }

  const minPrice = Math.min(...chartData.map(d => d.price)) * 0.95;
  const maxPrice = Math.max(...chartData.map(d => d.price)) * 1.05;

  return (
    <div className="w-full h-80 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Price Chart: {companyId}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[minPrice, maxPrice]} tickFormatter={(value) => `${value.toFixed(2)}`} />
          <Tooltip
            formatter={(value: number) => [`AED ${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#33C3F0" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="price"
            stroke="#33C3F0"
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ r: 4 }}
            fill="url(#priceGradient)"
          />
          {transactions
            .filter(t => t.companyId === companyId && t.type === 'buy' && t.day <= currentDay)
            .map((t, i) => (
              <ReferenceDot
                key={`buy-${i}`}
                x={`Day ${t.day}`}
                y={t.price}
                r={6}
                fill="#10B981"
                stroke="white"
              />
            ))}
          {transactions
            .filter(t => t.companyId === companyId && t.type === 'sell' && t.day <= currentDay)
            .map((t, i) => (
              <ReferenceDot
                key={`sell-${i}`}
                x={`Day ${t.day}`}
                y={t.price}
                r={6}
                fill="#EF4444"
                stroke="white"
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
