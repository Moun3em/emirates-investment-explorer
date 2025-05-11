import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GameState, MarketState, Transaction } from "@/types/game.types";
import {
	calculateHoldingValue,
	calculatePortfolioValue,
	calculateProfitLoss,
	getBestAndWorstTrades,
	getStockPrice,
} from "@/services/gameService";
import { ArrowUp, ArrowDown, Trophy, XCircle, Check } from "lucide-react";
import PortfolioChart from "./PortfolioChart";

interface GameResultsProps {
	isOpen: boolean;
	onClose: () => void;
	onPlayAgain: () => void;
	gameState: GameState;
	marketState: MarketState;
	onContinue?: () => void;
}

const GameResults = ({
	isOpen,
	onClose,
	onPlayAgain,
	gameState,
	marketState,
	onContinue,
}: GameResultsProps) => {
	if (!gameState) return null;

	const { amount, percentage } = calculateProfitLoss(gameState);
	const { bestTrade, worstTrade, bestReturn, worstReturn } =
		getBestAndWorstTrades(gameState, marketState);
	const isProfit = amount >= 0;

	const getBestCompanyName = () => {
		if (!bestTrade) return "None";
		const company = marketState.companies.find(
			(c) => c.id === bestTrade.companyId
		);
		return company ? company.name : bestTrade.companyId;
	};

	const getWorstCompanyName = () => {
		if (!worstTrade) return "None";
		const company = marketState.companies.find(
			(c) => c.id === worstTrade.companyId
		);
		return company ? company.name : worstTrade.companyId;
	};

	const getPerformanceFeedback = () => {
		if (percentage >= 20) {
			return "Exceptional! You have a natural talent for investing. Your strategic decisions led to outstanding returns!";
		} else if (percentage >= 10) {
			return "Great job! You made smart investment choices and achieved very good returns.";
		} else if (percentage >= 5) {
			return "Good work! Your portfolio performed well with solid investment choices.";
		} else if (percentage >= 0) {
			return "You ended with a profit, which is a good start. With practice, you can improve your returns even more!";
		} else if (percentage >= -5) {
			return "You had a small loss, but that's part of learning. Look at which stocks performed well to improve next time.";
		} else if (percentage >= -15) {
			return "This was a challenging game. Review your decisions and learn from the market patterns for better results next time.";
		} else {
			return "Investing can be difficult! Don't be discouraged, analyze what went wrong and try different strategies next time.";
		}
	};

	const getTips = () => {
		const tips = [];

		if (gameState.transactions.length < 5) {
			tips.push(
				"Try making more trades to take advantage of price movements."
			);
		}

		if (
			gameState.portfolio.holdings.length <= 1 &&
			gameState.transactions.length > 0
		) {
			tips.push(
				"Diversify your portfolio by investing in multiple companies to reduce risk."
			);
		}

		const soldWinners = gameState.transactions.filter((t) => {
			if (t.type !== "sell") return false;
			const finalPrice =
				getStockPrice(t.companyId, 5, marketState.priceData) || 0;
			return finalPrice > t.price;
		}).length;

		if (soldWinners > 0) {
			tips.push(
				"You sold some stocks that continued to rise. Consider holding winning positions longer."
			);
		}

		const keptLosers = gameState.portfolio.holdings.filter((h) => {
			const buyPrice = h.purchaseHistory[0].price;
			const finalPrice =
				getStockPrice(h.companyId, 5, marketState.priceData) || 0;
			return finalPrice < buyPrice;
		}).length;

		if (keptLosers > 0) {
			tips.push(
				"Some stocks in your final portfolio lost value. Be ready to sell underperforming stocks."
			);
		}

		if (gameState.portfolio.cash > gameState.startingCapital * 0.5) {
			tips.push(
				"You kept a lot of cash uninvested. Consider putting more money to work in the market."
			);
		}

		if (tips.length === 0) {
			tips.push(
				"You made balanced trading decisions. Keep refining your strategy!"
			);
		}

		return tips;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl flex items-center gap-2">
						Game Results
						{isProfit ? (
							<Trophy className="h-6 w-6 text-game-purple" />
						) : (
							<XCircle className="h-6 w-6 text-loss" />
						)}
					</DialogTitle>
					<DialogDescription>
						Let's see how your investments performed over the 5-day
						period.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 pt-4">
					<div className="bg-gray-50 p-6 rounded-lg">
						<h3 className="text-xl font-bold mb-2">
							Final Performance
						</h3>
						<div className="flex justify-between items-center">
							<div>
								<p className="text-gray-600">
									Starting Capital:
								</p>
								<p className="text-lg font-medium">
									AED {gameState.startingCapital.toFixed(2)}
								</p>
							</div>
							<div className="text-center">
								<div
									className={`inline-flex items-center justify-center p-4 rounded-full ${
										isProfit ? "bg-profit/10" : "bg-loss/10"
									}`}
								>
									{isProfit ? (
										<ArrowUp className="h-8 w-8 text-profit" />
									) : (
										<ArrowDown className="h-8 w-8 text-loss" />
									)}
								</div>
							</div>
							<div className="text-right">
								<p className="text-gray-600">
									Final Portfolio Value:
								</p>
								<p className="text-lg font-medium">
									AED{" "}
									{gameState.portfolioValueHistory[
										gameState.portfolioValueHistory.length -
											1
									].totalValue.toFixed(2)}
								</p>
							</div>
						</div>
						<Separator className="my-4" />
						<div className="flex justify-between items-center">
							<div>
								<p className="text-gray-600">
									Total Profit/Loss:
								</p>
								<p
									className={`text-xl font-bold ${
										isProfit ? "text-profit" : "text-loss"
									}`}
								>
									{isProfit ? "+" : ""}
									{amount.toFixed(2)} AED
								</p>
							</div>
							<div>
								<p className="text-gray-600">
									Return on Investment:
								</p>
								<p
									className={`text-xl font-bold ${
										isProfit ? "text-profit" : "text-loss"
									}`}
								>
									{isProfit ? "+" : ""}
									{percentage.toFixed(2)}%
								</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-white p-6 rounded-lg border">
							<h4 className="font-bold mb-2">Best Decision</h4>
							{bestTrade ? (
								<>
									<p>
										<span className="font-medium">
											Company:
										</span>{" "}
										{getBestCompanyName()}
									</p>
									<p>
										<span className="font-medium">
											Action:
										</span>{" "}
										{bestTrade.type.toUpperCase()}
									</p>
									<p>
										<span className="font-medium">
											Return:
										</span>{" "}
										<span className="text-profit">
											+{bestReturn.toFixed(2)}%
										</span>
									</p>
								</>
							) : (
								<p>No trades made</p>
							)}
						</div>
						<div className="bg-white p-6 rounded-lg border">
							<h4 className="font-bold mb-2">
								Challenging Decision
							</h4>
							{worstTrade ? (
								<>
									<p>
										<span className="font-medium">
											Company:
										</span>{" "}
										{getWorstCompanyName()}
									</p>
									<p>
										<span className="font-medium">
											Action:
										</span>{" "}
										{worstTrade.type.toUpperCase()}
									</p>
									<p>
										<span className="font-medium">
											Return:
										</span>{" "}
										<span
											className={
												worstReturn >= 0
													? "text-profit"
													: "text-loss"
											}
										>
											{worstReturn >= 0 ? "+" : ""}
											{worstReturn.toFixed(2)}%
										</span>
									</p>
								</>
							) : (
								<p>No trades made</p>
							)}
						</div>
					</div>

					<div className="mt-6">
						<h3 className="text-lg font-bold mb-4">
							Portfolio Performance
						</h3>
						<PortfolioChart
							portfolioHistory={gameState.portfolioValueHistory}
							currentDay={gameState.currentDay}
							setCurrentDay={() => {}}
							difficulty="normal"
							difficultyToTradesMap={{ normal: 3 }}
							advanceToNextDay={() => {}}
						/>
					</div>

					<div className="mt-6 space-y-4">
						<h3 className="text-lg font-bold">Feedback</h3>
						<p>{getPerformanceFeedback()}</p>

						<h3 className="text-lg font-bold">
							Tips for Improvement
						</h3>
						<ul className="space-y-2">
							{getTips().map((tip, index) => (
								<li
									key={index}
									className="flex items-start gap-2"
								>
									<Check className="h-5 w-5 text-game-purple mt-0.5 flex-shrink-0" />
									<span>{tip}</span>
								</li>
							))}
						</ul>
					</div>
					<div className="flex justify-between pt-6">
						<div className="space-x-2">
							<Button variant="outline" onClick={onClose}>
								Review Game
							</Button>
							<Button onClick={onPlayAgain}>Play Again</Button>
						</div>
						<div>
							{onContinue && gameState.currentDay < 5 && (
								<Button
									variant="secondary"
									onClick={onContinue}
								>
									Continue
								</Button>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default GameResults;
