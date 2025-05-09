import React, { useState, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Company, PriceData } from "@/types/game.types";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";

interface GameSettingsProps {
	isOpen: boolean;
	onClose: () => void;
	onStartGame: (startingCapital: number, tradesPerDay: number) => void;
	startingCapital?: number;
	companies?: Company[];
	priceData?: PriceData[];
	onUpdateCompanies?: (companies: Company[]) => void;
	onUpdatePriceData?: (priceData: PriceData[]) => void;
}

interface Trade {
	companyId: string;
	type: "buy" | "sell";
	shares: number;
	price: number;
	day: number;
}

interface Portfolio {
	cash: number;
	holdings: {
		[companyId: string]: {
			shares: number;
			averagePrice: number;
		};
	};
}

const GameSettingsDialog = ({
	isOpen,
	onClose,
	onStartGame,
	startingCapital = 10000,
	companies = [],
	priceData = [],
	onUpdateCompanies,
	onUpdatePriceData,
}: GameSettingsProps) => {
	const [capital, setCapital] = useState<number>(startingCapital);
	const [difficulty, setDifficulty] = useState<string>("medium");
	const [activeTab, setActiveTab] = useState<string>("general");
	const [newsScript, setNewsScript] = useState<string>("");
	const [marketImpact, setMarketImpact] = useState<number>(0);

	// For company editing
	const [editableCompanies, setEditableCompanies] =
		useState<Company[]>(companies);
	const [editablePriceData, setEditablePriceData] =
		useState<PriceData[]>(priceData);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const difficultyToTradesMap = {
		easy: 3,
		medium: 6,
		hard: 9,
	};

	const [portfolio, setPortfolio] = useState<Portfolio>({
		cash: startingCapital,
		holdings: {},
	});

	const [currentDay, setCurrentDay] = useState<number>(1);

	const [tradesLeft, setTradesLeft] = useState<TradeDots>({
		total: difficultyToTradesMap[
			difficulty as keyof typeof difficultyToTradesMap
		],
		used: 0,
	});

	const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value);
		setCapital(isNaN(value) || value <= 0 ? 1000 : value);
	};

	const handleDifficultyChange = (newDifficulty: string) => {
		setDifficulty(newDifficulty);
		setTradesLeft({
			total: difficultyToTradesMap[
				newDifficulty as keyof typeof difficultyToTradesMap
			],
			used: 0,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onStartGame(
			capital,
			difficultyToTradesMap[
				difficulty as keyof typeof difficultyToTradesMap
			]
		);

		// If admin settings were changed, update them
		if (activeTab === "admin" && onUpdateCompanies && onUpdatePriceData) {
			onUpdateCompanies(editableCompanies);
			onUpdatePriceData(editablePriceData);
		}
	};

	const updateCompanyName = (companyId: string, name: string) => {
		setEditableCompanies((prev) =>
			prev.map((company) =>
				company.id === companyId ? { ...company, name } : company
			)
		);
	};

	const updateCompanyPrice = (
		companyId: string,
		day: number,
		price: number
	) => {
		setEditablePriceData((prev) =>
			prev.map((item) => {
				if (item.companyId === companyId) {
					const updatedItem = { ...item };
					if (day === 1) updatedItem.day1Price = price;
					else if (day === 2) updatedItem.day2Price = price;
					else if (day === 3) updatedItem.day3Price = price;
					else if (day === 4) updatedItem.day4Price = price;
					else if (day === 5) updatedItem.day5Price = price;
					return updatedItem;
				}
				return item;
			})
		);
	};

	const removeCompany = (companyId: string) => {
		setEditableCompanies((prev) =>
			prev.filter((company) => company.id !== companyId)
		);
		setEditablePriceData((prev) =>
			prev.filter((item) => item.companyId !== companyId)
		);
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Check if it's a CSV or Excel file
		const fileType = file.type;
		if (
			fileType !== "text/csv" &&
			fileType !== "application/vnd.ms-excel" &&
			fileType !==
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		) {
			toast.error("Please upload a CSV or Excel file");
			return;
		}

		// For demo purposes, we'll just show a success message
		// In a real app, you'd parse the file and update the companies/prices
		toast.success(
			`File '${file.name}' uploaded successfully. In a real implementation, this data would be processed.`
		);

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const applyMarketNews = () => {
		if (!newsScript.trim()) {
			toast.error("Please enter a news script");
			return;
		}

		if (marketImpact === 0) {
			toast.error("Please set a market impact percentage");
			return;
		}

		// Apply the percentage change to all stock prices
		const updatedPriceData = editablePriceData.map((item) => {
			const multiplier = 1 + marketImpact / 100;
			return {
				...item,
				day2Price: item.day2Price * multiplier,
				day3Price: item.day3Price * multiplier,
				day4Price: item.day4Price * multiplier,
				day5Price: item.day5Price * multiplier,
			};
		});

		setEditablePriceData(updatedPriceData);
		toast.success(
			`Market news applied with ${marketImpact}% impact on all future prices`
		);
	};

	const calculateTrade = (
		portfolio: Portfolio,
		trade: Trade,
		currentDay: number
	): { newPortfolio: Portfolio; isValid: boolean; message: string } => {
		const { companyId, type, shares, price } = trade;
		const totalValue = shares * price;

		// Check if it's a valid day for trading
		if (currentDay < 1 || currentDay > 5) {
			return {
				newPortfolio: portfolio,
				isValid: false,
				message: "Invalid trading day",
			};
		}

		// Check if we have enough cash for buying
		if (type === "buy" && totalValue > portfolio.cash) {
			return {
				newPortfolio: portfolio,
				isValid: false,
				message: "Insufficient funds",
			};
		}

		// Check if we have enough shares for selling
		if (type === "sell") {
			const currentHolding = portfolio.holdings[companyId];
			if (!currentHolding || currentHolding.shares < shares) {
				return {
					newPortfolio: portfolio,
					isValid: false,
					message: "Insufficient shares",
				};
			}
		}

		// Create new portfolio state
		const newPortfolio = { ...portfolio };

		if (type === "buy") {
			// Update cash
			newPortfolio.cash -= totalValue;

			// Update holdings
			if (!newPortfolio.holdings[companyId]) {
				newPortfolio.holdings[companyId] = {
					shares: 0,
					averagePrice: 0,
				};
			}

			const currentHolding = newPortfolio.holdings[companyId];
			const totalShares = currentHolding.shares + shares;
			const totalCost =
				currentHolding.shares * currentHolding.averagePrice +
				totalValue;

			newPortfolio.holdings[companyId] = {
				shares: totalShares,
				averagePrice: totalCost / totalShares,
			};
		} else {
			// Update cash
			newPortfolio.cash += totalValue;

			// Update holdings
			const currentHolding = newPortfolio.holdings[companyId];
			newPortfolio.holdings[companyId] = {
				shares: currentHolding.shares - shares,
				averagePrice: currentHolding.averagePrice,
			};
		}

		return {
			newPortfolio,
			isValid: true,
			message: `${
				type === "buy" ? "Bought" : "Sold"
			} ${shares} shares at ${price}`,
		};
	};

	const calculatePortfolioValue = (
		portfolio: Portfolio,
		currentDay: number,
		priceData: PriceData[]
	): number => {
		let totalValue = portfolio.cash;

		Object.entries(portfolio.holdings).forEach(([companyId, holding]) => {
			const priceInfo = priceData.find(
				(data) => data.companyId === companyId
			);
			if (priceInfo) {
				const currentPrice = priceInfo[
					`day${currentDay}Price` as keyof PriceData
				] as number;
				totalValue += holding.shares * currentPrice;
			}
		});

		return totalValue;
	};

	const handleTrade = (trade: Trade) => {
		// Check if we have trades left
		if (tradesLeft.used >= tradesLeft.total) {
			toast.error("No trades left for today");
			return;
		}

		const result = calculateTrade(portfolio, trade, currentDay);

		if (result.isValid) {
			setPortfolio(result.newPortfolio);
			setTradesLeft((prev) => ({
				...prev,
				used: prev.used + 1,
			}));
			toast.success(result.message);
		} else {
			toast.error(result.message);
		}
	};

	const getCurrentPrice = (companyId: string): number => {
		const priceInfo = editablePriceData.find(
			(data) => data.companyId === companyId
		);
		if (priceInfo) {
			return priceInfo[
				`day${currentDay}Price` as keyof PriceData
			] as number;
		}
		return 0;
	};

	const advanceToNextDay = () => {
		if (currentDay < 5) {
			setCurrentDay((prev) => prev + 1);
			setTradesLeft({
				total: difficultyToTradesMap[
					difficulty as keyof typeof difficultyToTradesMap
				],
				used: 0,
			});
			toast.success(`Advanced to Day ${currentDay + 1}`);
		} else {
			toast.error("Game is complete!");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[95vw] md:max-w-[1200px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Game Settings</DialogTitle>
					<DialogDescription>
						Configure your game settings before starting a new game.
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="general">Game Settings</TabsTrigger>
						<TabsTrigger value="admin">Admin Settings</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-4">
						<form
							onSubmit={handleSubmit}
							className="space-y-4 pt-4"
						>
							<div className="space-y-2">
								<Label htmlFor="startingCapital">
									Starting Capital (AED)
								</Label>
								<Input
									id="startingCapital"
									type="number"
									min="1000"
									step="1000"
									value={capital}
									onChange={handleCapitalChange}
								/>
								<p className="text-xs text-gray-500">
									This is the amount of cash you'll start with
									(minimum AED 1,000).
								</p>
							</div>

							<div className="space-y-2">
								<Label>Difficulty</Label>
								<div className="flex items-center justify-center gap-4 mt-2">
									<Button
										type="button"
										variant={
											difficulty === "easy"
												? "default"
												: "outline"
										}
										onClick={() =>
											handleDifficultyChange("easy")
										}
										className="flex-1"
									>
										Easy
									</Button>
									<Button
										type="button"
										variant={
											difficulty === "medium"
												? "default"
												: "outline"
										}
										onClick={() =>
											handleDifficultyChange("medium")
										}
										className="flex-1"
									>
										Medium
									</Button>
									<Button
										type="button"
										variant={
											difficulty === "hard"
												? "default"
												: "outline"
										}
										onClick={() =>
											handleDifficultyChange("hard")
										}
										className="flex-1"
									>
										Hard
									</Button>
								</div>
							</div>

							<div className="flex flex-col space-y-2">
								<p className="text-sm font-medium">
									Game Rules:
								</p>
								<ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
									<li>
										The game simulates 5 trading days in the
										UAE stock market.
									</li>
									<li>
										You can make up to{" "}
										{
											difficultyToTradesMap[
												difficulty as keyof typeof difficultyToTradesMap
											]
										}{" "}
										trades per day.
									</li>
									<li>
										Prices change daily based on market
										conditions.
									</li>
									<li>You can buy fractional shares.</li>
									<li>
										The goal is to maximize your portfolio
										value by Day 5.
									</li>
								</ul>
							</div>

							<div className="flex justify-end space-x-2 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={onClose}
								>
									Cancel
								</Button>
								<Button type="submit">Start Game</Button>
							</div>
						</form>
					</TabsContent>

					<TabsContent value="admin" className="space-y-4">
						<Card className="p-4">
							<h3 className="font-medium mb-2">
								Upload Company Data
							</h3>
							<div className="flex items-center gap-4 mb-6">
								<Input
									type="file"
									accept=".csv,.xlsx,.xls"
									ref={fileInputRef}
									onChange={handleFileUpload}
									className="flex-1"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										fileInputRef.current?.click()
									}
									className="whitespace-nowrap"
								>
									<Upload className="h-4 w-4 mr-2" />
									Upload
								</Button>
							</div>

							<h3 className="font-medium mb-2">Market News</h3>
							<div className="space-y-2 mb-6">
								<Label htmlFor="newsScript">News Script</Label>
								<Textarea
									id="newsScript"
									placeholder="Enter market news that will affect all stocks..."
									value={newsScript}
									onChange={(e) =>
										setNewsScript(e.target.value)
									}
									rows={3}
									className="resize-none"
								/>
								<div className="flex items-center gap-4">
									<div className="flex-1">
										<Label htmlFor="marketImpact">
											Market Impact (%)
										</Label>
										<Input
											id="marketImpact"
											type="number"
											value={marketImpact}
											onChange={(e) =>
												setMarketImpact(
													parseFloat(
														e.target.value
													) || 0
												)
											}
											min="-50"
											max="50"
											step="0.5"
											placeholder="-50 to +50"
										/>
									</div>
									<Button
										type="button"
										onClick={applyMarketNews}
										className="mt-6"
									>
										Apply
									</Button>
								</div>
								<p className="text-xs text-gray-500">
									This will affect all stock prices for future
									days by the specified percentage.
								</p>
							</div>

							<h3 className="font-medium mb-2">
								Edit Companies & Prices
							</h3>
							<div className="overflow-x-auto -mx-4 sm:mx-0">
								<table className="w-full min-w-[1000px]">
									<thead className="bg-muted">
										<tr>
											<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
												Company
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
												Day 1
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
												Day 2
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
												Day 3
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
												Day 4
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
												Day 5
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
												Action
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-muted">
										{editableCompanies.map((company) => {
											const prices =
												editablePriceData.find(
													(data) =>
														data.companyId ===
														company.id
												);
											return (
												<tr key={company.id}>
													<td className="px-4 py-2">
														<Input
															value={company.name}
															onChange={(e) =>
																updateCompanyName(
																	company.id,
																	e.target
																		.value
																)
															}
															className="w-full h-8 text-sm min-w-[200px]"
														/>
													</td>
													<td className="px-4 py-2">
														<Input
															type="number"
															value={
																prices?.day1Price ||
																0
															}
															onChange={(e) =>
																updateCompanyPrice(
																	company.id,
																	1,
																	parseFloat(
																		e.target
																			.value
																	) || 0
																)
															}
															className="w-24 h-8 text-sm"
															step="0.01"
														/>
													</td>
													<td className="px-4 py-2">
														<Input
															type="number"
															value={
																prices?.day2Price ||
																0
															}
															onChange={(e) =>
																updateCompanyPrice(
																	company.id,
																	2,
																	parseFloat(
																		e.target
																			.value
																	) || 0
																)
															}
															className="w-24 h-8 text-sm"
															step="0.01"
														/>
													</td>
													<td className="px-4 py-2">
														<Input
															type="number"
															value={
																prices?.day3Price ||
																0
															}
															onChange={(e) =>
																updateCompanyPrice(
																	company.id,
																	3,
																	parseFloat(
																		e.target
																			.value
																	) || 0
																)
															}
															className="w-24 h-8 text-sm"
															step="0.01"
														/>
													</td>
													<td className="px-4 py-2">
														<Input
															type="number"
															value={
																prices?.day4Price ||
																0
															}
															onChange={(e) =>
																updateCompanyPrice(
																	company.id,
																	4,
																	parseFloat(
																		e.target
																			.value
																	) || 0
																)
															}
															className="w-24 h-8 text-sm"
															step="0.01"
														/>
													</td>
													<td className="px-4 py-2">
														<Input
															type="number"
															value={
																prices?.day5Price ||
																0
															}
															onChange={(e) =>
																updateCompanyPrice(
																	company.id,
																	5,
																	parseFloat(
																		e.target
																			.value
																	) || 0
																)
															}
															className="w-24 h-8 text-sm"
															step="0.01"
														/>
													</td>
													<td className="px-4 py-2">
														<Button
															variant="destructive"
															size="sm"
															onClick={() =>
																removeCompany(
																	company.id
																)
															}
															className="whitespace-nowrap"
														>
															Remove
														</Button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</Card>
						<div className="flex justify-end space-x-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
							>
								Cancel
							</Button>
							<Button onClick={handleSubmit}>
								Save & Start Game
							</Button>
						</div>
					</TabsContent>
				</Tabs>

				<div className="space-y-4 mb-6">
					<div className="grid grid-cols-2 gap-4">
						<Card className="p-4">
							<h4 className="font-medium mb-2">
								Portfolio Summary
							</h4>
							<p>Cash: AED {portfolio.cash.toFixed(2)}</p>
							<p>Current Day: {currentDay}</p>
							<p>
								Portfolio Value: AED{" "}
								{calculatePortfolioValue(
									portfolio,
									currentDay,
									editablePriceData
								).toFixed(2)}
							</p>
							<Button
								onClick={advanceToNextDay}
								disabled={currentDay >= 5}
								className="mt-2"
							>
								Next Day
							</Button>
						</Card>
						<Card className="p-4">
							<h4 className="font-medium mb-2">Holdings</h4>
							{Object.entries(portfolio.holdings).map(
								([companyId, holding]) => {
									const company = editableCompanies.find(
										(c) => c.id === companyId
									);
									const currentPrice =
										getCurrentPrice(companyId);
									const marketValue =
										holding.shares * currentPrice;
									const profitLoss =
										marketValue -
										holding.shares * holding.averagePrice;

									return (
										<div key={companyId} className="mb-2">
											<p className="font-medium">
												{company?.name}
											</p>
											<p>Shares: {holding.shares}</p>
											<p>
												Avg Price: AED{" "}
												{holding.averagePrice.toFixed(
													2
												)}
											</p>
											<p>
												Current Price: AED{" "}
												{currentPrice.toFixed(2)}
											</p>
											<p
												className={
													profitLoss >= 0
														? "text-green-500"
														: "text-red-500"
												}
											>
												P/L: AED {profitLoss.toFixed(2)}
											</p>
										</div>
									);
								}
							)}
						</Card>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default GameSettingsDialog;
