import * as React from "react";
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
	AreaChart,
} from "recharts";
import { PortfolioSnapshot } from "@/types/game.types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface PortfolioChartProps {
	portfolioHistory: PortfolioSnapshot[];
	currentDay: number;
	setCurrentDay: React.Dispatch<React.SetStateAction<number>>;
	difficulty: string;
	difficultyToTradesMap: Record<string, number>;
	advanceToNextDay: () => void;
}

interface ChartDataPoint {
	name: string;
	value: number;
	cash: number;
	stocks: number;
	change?: number;
}

const PortfolioChart = ({
	portfolioHistory,
	currentDay,
	setCurrentDay,
	difficulty,
	difficultyToTradesMap,
	advanceToNextDay,
}: PortfolioChartProps) => {
	if (!portfolioHistory || portfolioHistory.length === 0) {
		return <div>No portfolio data available</div>;
	}

	const dedupedSortedHistory = Array.from(
		new Map(
			portfolioHistory
				.sort((a, b) => a.day - b.day)
				.map((item) => [item.day, item])
		).values()
	);

	const chartData: ChartDataPoint[] = dedupedSortedHistory.map(
		(snapshot) => ({
			name: `Day ${snapshot.day}`,
			value: snapshot.totalValue,
			cash: snapshot.cash,
			stocks: snapshot.holdingsValue,
			change: snapshot.percentChange || 0,
		})
	);

	const labels = portfolioHistory.map((item) => `Day ${item.day}`);

	const [tradesLeft, setTradesLeft] = useState({
		total: difficultyToTradesMap?.[difficulty] ?? 3,
		used: 0,
	});

	React.useEffect(() => {
		setTradesLeft({
			total: difficultyToTradesMap?.[difficulty] ?? 3,
			used: 0,
		});
	}, [difficultyToTradesMap, difficulty]);

	return (
		<div className="w-full h-80 bg-white rounded-lg shadow p-4">
			<h3 className="text-lg font-semibold mb-4">Portfolio Value</h3>
			<div className="mb-2 text-md font-medium">Day {currentDay}/6</div>
			<ResponsiveContainer width="100%" height="85%">
				<AreaChart
					data={chartData}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis tickFormatter={(value) => `${value.toFixed(0)}`} />
					<Tooltip
						formatter={(value: number) => [
							`AED ${value.toFixed(2)}`,
							"",
						]}
						labelFormatter={(label) => `${label}`}
					/>
					<Legend />
					<defs>
						<linearGradient
							id="cashGradient"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="#FEF7CD"
								stopOpacity={0.8}
							/>
							<stop
								offset="95%"
								stopColor="#FEF7CD"
								stopOpacity={0.2}
							/>
						</linearGradient>
						<linearGradient
							id="stocksGradient"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="#9b87f5"
								stopOpacity={0.8}
							/>
							<stop
								offset="95%"
								stopColor="#9b87f5"
								stopOpacity={0.2}
							/>
						</linearGradient>
						<linearGradient
							id="totalGradient"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="#33C3F0"
								stopOpacity={0.8}
							/>
							<stop
								offset="95%"
								stopColor="#33C3F0"
								stopOpacity={0.2}
							/>
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
		
			{currentDay >= 6 && (
				<div>
					<h2>Game Over! Here are your results.</h2>
					{/* ...results summary... */}
				</div>
			)}
		</div>
	);
};

export default PortfolioChart;
