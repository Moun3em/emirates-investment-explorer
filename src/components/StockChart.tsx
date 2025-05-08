
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
  // Validate input data
  if (!Array.isArray(priceData) || priceData.length === 0) {
    return <div className="p-4 text-center">No price data available</div>;
  }
  
  const company = priceData.find(data => data.companyId === companyId);
  if (!company) {
    return <div className="p-4 text-center">No data available for this company</div>;
  }

  const chartData: ChartDataPoint[] = [];
  
  // Process chart data with robust error handling
  try {
    // Add price data points for days up to current day - with validation
    for (let i = 1; i <= currentDay; i++) {
      const price = getPrice(i);
      if (price !== null && isFinite(price) && price > 0) {
        chartData.push({
          name: `Day ${i}`,
          price
        });
      }
    }
  
    // Add transaction markers - with validation
    if (Array.isArray(transactions) && transactions.length > 0) {
      transactions
        .filter(t => t && t.companyId === companyId && t.day <= currentDay)
        .forEach(transaction => {
          if (!transaction.price || !isFinite(transaction.price)) return;
          
          const dataPoint = chartData.find(point => point && point.name === `Day ${transaction.day}`);
          if (dataPoint) {
            if (transaction.type === 'buy') {
              dataPoint.buys = transaction.price;
            } else {
              dataPoint.sells = transaction.price;
            }
          }
        });
    }
  } catch (error) {
    console.error("Error processing chart data:", error);
    return <div className="p-4 text-center">Error processing chart data</div>;
  }

  // Safety check to prevent invalid array errors
  if (chartData.length === 0) {
    return <div className="p-4 text-center">No valid price data available for charting</div>;
  }
  
  function getPrice(day: number): number | null {
    if (!company) return null;
    
    let price: number | undefined;
    
    switch (day) {
      case 1: price = company.day1Price; break;
      case 2: price = company.day2Price; break;
      case 3: price = company.day3Price; break;
      case 4: price = company.day4Price; break;
      case 5: price = company.day5Price; break;
      default: return null;
    }
    
    return (typeof price === 'number' && isFinite(price)) ? price : null;
  }

  // Calculate min and max with safety checks
  const validPrices = chartData.map(d => d.price).filter(p => isFinite(p) && p > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) * 0.95 : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) * 1.05 : 100;

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
          <YAxis 
            domain={[minPrice, maxPrice]} 
            tickFormatter={(value) => `${isFinite(value) ? value.toFixed(2) : "0.00"}`}
          />
          <Tooltip
            formatter={(value: number) => {
              return isFinite(value) ? [`AED ${value.toFixed(2)}`, 'Price'] : ['N/A', 'Price'];
            }}
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
            isAnimationActive={false}
          />
          {Array.isArray(transactions) && transactions
            .filter(t => t && t.companyId === companyId && t.type === 'buy' && t.day <= currentDay)
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
          {Array.isArray(transactions) && transactions
            .filter(t => t && t.companyId === companyId && t.type === 'sell' && t.day <= currentDay)
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
