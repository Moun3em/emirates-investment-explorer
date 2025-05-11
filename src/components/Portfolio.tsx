import React from "react";
import { Card } from "@/components/ui/card";
import {
	ArrowUp,
	ArrowDown,
	DollarSign,
	CircleArrowUp,
	CircleArrowDown,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Company, GameState, MarketState } from "@/types/game.types";
import { getStockPrice } from "@/services/gameService";
import PortfolioChart from "./PortfolioChart";

interface PortfolioProps {
	gameState: GameState;
	marketState: MarketState;
}

const Portfolio = ({ gameState, marketState }: PortfolioProps) => {
	const { portfolio, portfolioValueHistory, currentDay } = gameState;
	const { cash, holdings } = portfolio;
	const { companies, priceData } = marketState;

	// Calculate total portfolio value
	const totalValue =
		portfolioValueHistory.length > 0
			? portfolioValueHistory[portfolioValueHistory.length - 1].totalValue
			: cash;

	// Calculate daily change
	const hasPreviousDay = portfolioValueHistory.length >= 2;
	const previousDayValue = hasPreviousDay
		? portfolioValueHistory[portfolioValueHistory.length - 2].totalValue
		: gameState.startingCapital;

	const dailyChange = totalValue - previousDayValue;
	const dailyChangePercent =
		previousDayValue > 0 ? (dailyChange / previousDayValue) * 100 : 0;

	// Calculate total gain/loss
	const totalChange = totalValue - gameState.startingCapital;
	const totalChangePercent = (totalChange / gameState.startingCapital) * 100;

	// Helper to find company by ID
	const getCompanyById = (id: string): Company | undefined => {
		return companies.find((c) => c.id === id);
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<DollarSign className="h-4 w-4 text-gray-500" />
						<h3 className="font-medium">Cash Available</h3>
					</div>
					<p className="text-2xl font-bold mt-2">
						AED {cash.toFixed(2)}
					</p>
				</Card>

				<Card className="p-4">
					<div className="flex items-center space-x-2">
						{dailyChange >= 0 ? (
							<CircleArrowUp className="h-4 w-4 text-profit" />
						) : (
							<CircleArrowDown className="h-4 w-4 text-loss" />
						)}
						<h3 className="font-medium">Daily Change</h3>
					</div>
					<div className="flex items-baseline space-x-2 mt-2">
						<p
							className={`text-2xl font-bold ${
								dailyChange >= 0 ? "text-profit" : "text-loss"
							}`}
						>
							{dailyChange >= 0 ? "+" : ""}
							{dailyChange.toFixed(2)}
						</p>
						<p
							className={`${
								dailyChange >= 0 ? "text-profit" : "text-loss"
							}`}
						>
							({dailyChange >= 0 ? "+" : ""}
							{dailyChangePercent.toFixed(2)}%)
						</p>
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center space-x-2">
						{totalChange >= 0 ? (
							<CircleArrowUp className="h-4 w-4 text-profit" />
						) : (
							<CircleArrowDown className="h-4 w-4 text-loss" />
						)}
						<h3 className="font-medium">Total Gain/Loss</h3>
					</div>
					<div className="flex items-baseline space-x-2 mt-2">
						<p
							className={`text-2xl font-bold ${
								totalChange >= 0 ? "text-profit" : "text-loss"
							}`}
						>
							{totalChange >= 0 ? "+" : ""}
							{totalChange.toFixed(2)}
						</p>
						<p
							className={`${
								totalChange >= 0 ? "text-profit" : "text-loss"
							}`}
						>
							({totalChange >= 0 ? "+" : ""}
							{totalChangePercent.toFixed(2)}%)
						</p>
					</div>
				</Card>
			</div>

			<PortfolioChart
				portfolioHistory={portfolioValueHistory}
				currentDay={currentDay}
				setCurrentDay={() => {}}
				difficulty="normal"
				difficultyToTradesMap={{ normal: 3 }}
				advanceToNextDay={() => {}}
			/>

			<div>
				<h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
				{holdings.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Company
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Shares
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Current Price
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Current Value
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Gain/Loss
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{holdings.map((holding) => {
									const company = getCompanyById(
										holding.companyId
									);
									const currentPrice =
										getStockPrice(
											holding.companyId,
											currentDay,
											priceData
										) || 0;
									const currentValue =
										currentPrice * holding.shares;

									// Calculate average purchase price
									const totalPurchaseCost =
										holding.purchaseHistory.reduce(
											(acc, purchase) =>
												acc +
												purchase.price *
													purchase.shares,
											0
										);
									const totalShares = holding.shares;
									const avgPurchasePrice =
										totalShares > 0
											? totalPurchaseCost / totalShares
											: 0;

									// Calculate gain/loss
									const gainLoss =
										currentValue - totalPurchaseCost;
									const gainLossPercent =
										totalPurchaseCost > 0
											? (gainLoss / totalPurchaseCost) *
											  100
											: 0;

									return (
										<tr key={holding.companyId}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900">
													{company?.name ||
														holding.companyId}
												</div>
												<div className="text-gray-500 text-sm">
													{company?.ticker ||
														holding.companyId}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												{holding.shares.toFixed(2)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<div>
													{currentPrice.toFixed(2)}
												</div>
												<div className="text-gray-500 text-sm">
													avg:{" "}
													{avgPurchasePrice.toFixed(
														2
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right font-medium">
												{currentValue.toFixed(2)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<div
													className={`font-medium ${
														gainLoss >= 0
															? "text-profit"
															: "text-loss"
													}`}
												>
													{gainLoss.toFixed(2)}
												</div>
												<div
													className={`text-sm ${
														gainLoss >= 0
															? "text-profit"
															: "text-loss"
													}`}
												>
													{gainLoss >= 0 ? "+" : ""}
													{gainLossPercent.toFixed(2)}
													%
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
							<tfoot className="bg-gray-50">
								<tr>
									<td className="px-6 py-4 whitespace-nowrap font-bold">
										Total
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right"></td>
									<td className="px-6 py-4 whitespace-nowrap text-right"></td>
									<td className="px-6 py-4 whitespace-nowrap text-right font-bold">
										{holdings
											.reduce((total, holding) => {
												const currentPrice =
													getStockPrice(
														holding.companyId,
														currentDay,
														priceData
													) || 0;
												return (
													total +
													currentPrice *
														holding.shares
												);
											}, 0)
											.toFixed(2)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right"></td>
								</tr>
							</tfoot>
						</table>
					</div>
				) : (
					<Card className="p-8 text-center">
						<p className="text-gray-500">
							You don't own any stocks yet.
						</p>
						<p className="text-gray-500">
							Start trading to build your portfolio!
						</p>
					</Card>
				)}
			</div>
		</div>
	);
};

export default Portfolio;
