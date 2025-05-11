import * as React from "react";
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
import type { Company, PriceData } from "@/types/game.types";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";

/*
CSV Upload Logic:
- When a user uploads a CSV file using the Upload button, all company and price data in the app is instantly replaced with the data from the uploaded CSV file.
- The changes are reflected automatically in:
  1. The Edit Companies and Prices table (admin/settings)
  2. The Home dashboard, including the Select Company dropdown and any other place where company data is shown
- The update is immediate and seamless: all relevant tables, dropdowns, and displays show the new data from the CSV without requiring a page reload or any API call.
- The CSV is parsed and the app's state is updated on the client side only.
*/

interface GameSettingsProps {
	isOpen: boolean;
	onClose: () => void;
	onStartGame: (
		startingCapital: number,
		tradesPerDay: number,
		difficulty: string
	) => void;
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

interface TradeDots {
	total: number;
	used: number;
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
	const [capital, setCapital] = React.useState<number>(startingCapital);
	const [difficulty, setDifficulty] = React.useState<string>("easy");
	const [activeTab, setActiveTab] = React.useState<string>("general");
	const [dayImpacts, setDayImpacts] = React.useState<{
		[key: number]: number | "";
	}>({
		2: "",
		3: "",
		4: "",
		5: "",
	});

	// For company editing
	const [editableCompanies, setEditableCompanies] =
		React.useState<Company[]>(companies);
	const [editablePriceData, setEditablePriceData] =
		React.useState<PriceData[]>(priceData);

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const difficultyToTradesMap = {
		easy: 3,
		medium: 6,
		hard: 9,
	};

	const [portfolio, setPortfolio] = React.useState<Portfolio>({
		cash: startingCapital,
		holdings: {},
	});

	const [currentDay, setCurrentDay] = React.useState<number>(1);

	const [tradesLeft, setTradesLeft] = React.useState<TradeDots>({
		total: difficultyToTradesMap[
			difficulty as keyof typeof difficultyToTradesMap
		],
		used: 0,
	});

	const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] =
		React.useState(false);
	const [newCompany, setNewCompany] = React.useState<Partial<Company>>({
		name: "",
		ticker: "",
		sector: "",
		description: "",
	});

	const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value);
		setCapital(isNaN(value) || value <= 0 ? 1000 : value);
	};

	const handleDifficultyChange = (newDifficulty: string) => {
		setDifficulty(newDifficulty);
		setPortfolio({
			cash: startingCapital,
			holdings: {},
		});
		setCurrentDay(1);
		setTradesLeft({
			total: difficultyToTradesMap[
				newDifficulty as keyof typeof difficultyToTradesMap
			],
			used: 0,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const tradesPerDay =
			difficultyToTradesMap[
				difficulty as keyof typeof difficultyToTradesMap
			];

		setPortfolio({
			cash: capital,
			holdings: {},
		});
		setCurrentDay(1);
		setTradesLeft({
			total: tradesPerDay,
			used: 0,
		});

		onStartGame(capital, tradesPerDay, difficulty);

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
		value: string
	) => {
		// Allow empty string
		if (value === "") {
			setEditablePriceData((prev) =>
				prev.map((item) => {
					if (item.companyId === companyId) {
						const updatedItem = { ...item };
						if (day === 1) updatedItem.day1Price = "";
						else if (day === 2) updatedItem.day2Price = "";
						else if (day === 3) updatedItem.day3Price = "";
						else if (day === 4) updatedItem.day4Price = "";
						else if (day === 5) updatedItem.day5Price = "";
						return updatedItem;
					}
					return item;
				})
			);
			return;
		}

		// Only allow numbers and decimal point
		if (!/^\d*\.?\d*$/.test(value)) {
			return;
		}

		// Parse the value and ensure it's not negative
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			// Only update if the value is non-negative
			if (numValue >= 0) {
				setEditablePriceData((prev) =>
					prev.map((item) => {
						if (item.companyId === companyId) {
							const updatedItem = { ...item };
							if (day === 1) updatedItem.day1Price = numValue;
							else if (day === 2)
								updatedItem.day2Price = numValue;
							else if (day === 3)
								updatedItem.day3Price = numValue;
							else if (day === 4)
								updatedItem.day4Price = numValue;
							else if (day === 5)
								updatedItem.day5Price = numValue;
							return updatedItem;
						}
						return item;
					})
				);
			}
		}
	};

	const removeCompany = (companyId: string) => {
		setEditableCompanies((prev) =>
			prev.filter((company) => company.id !== companyId)
		);
		setEditablePriceData((prev) =>
			prev.filter((item) => item.companyId !== companyId)
		);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !file.name.endsWith(".csv")) {
			toast.error("Please upload a CSV file");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const rows = text.split(/\r?\n/).filter(Boolean);
			if (rows.length < 2) {
				toast.error("CSV file is empty or invalid");
				return;
			}

			const headers = rows[0].split(/,\s*/).map(h => h.trim());
		
			// Find column indices based on exact header names
			const nameIdx = headers.findIndex(h => h === "Company Name");
			const tickerIdx = headers.findIndex(h => h === "Ticker Symbol");
			const sectorIdx = headers.findIndex(h => h === "Sector");
			const descriptionIdx = headers.findIndex(h => h === "Description");
			const day1Idx = headers.findIndex(h => h === "Day 1");
			const day2Idx = headers.findIndex(h => h === "Day 2");
			const day3Idx = headers.findIndex(h => h === "Day 3");
			const day4Idx = headers.findIndex(h => h === "Day 4");
			const day5Idx = headers.findIndex(h => h === "Day 5");

			// Validate required columns
			if (nameIdx === -1 || tickerIdx === -1 || day1Idx === -1 || day2Idx === -1 || day3Idx === -1 || day4Idx === -1 || day5Idx === -1) {
				toast.error("CSV file must contain Company Name, Ticker Symbol, and Day 1-5 columns");
				return;
			}

			const companies: Company[] = [];
			const priceData: PriceData[] = [];

			for (let i = 1; i < rows.length; i++) {
				const cols = rows[i].split(/,\s*/).map(col => col.trim());
				if (cols.length < headers.length) continue;

				const companyName = cols[nameIdx];
				const ticker = cols[tickerIdx];
				const sector = cols[sectorIdx] || "";
				const description = cols[descriptionIdx] || "";

				if (!companyName || !ticker) continue;

				companies.push({
					id: ticker, // Use ticker as the unique identifier
					name: companyName,
					ticker: ticker,
					sector: sector,
					description: description,
				});

				priceData.push({
					companyId: ticker,
					day1Price: parseFloat(cols[day1Idx]) || 0,
					day2Price: parseFloat(cols[day2Idx]) || 0,
					day3Price: parseFloat(cols[day3Idx]) || 0,
					day4Price: parseFloat(cols[day4Idx]) || 0,
					day5Price: parseFloat(cols[day5Idx]) || 0,
				});
			}

			if (companies.length === 0) {
				toast.error("No valid company data found in CSV");
				return;
			}

			// Update state
			setEditableCompanies(companies);
			setEditablePriceData(priceData);

			// Update parent components
			if (onUpdateCompanies) onUpdateCompanies(companies);
			if (onUpdatePriceData) onUpdatePriceData(priceData);

			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			toast.success(`Successfully loaded ${companies.length} companies from CSV`);
		};

		reader.readAsText(file);
	};

	const handleDayImpactChange = (day: number, value: string) => {
		// Allow empty string
		if (value === "") {
			setDayImpacts((prev) => ({
				...prev,
				[day]: "",
			}));
			return;
		}

		// Allow negative numbers and decimal points
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			setDayImpacts((prev) => ({
				...prev,
				[day]: numValue,
			}));
		}
	};

	const applyMarketImpact = (day: number) => {
		const impact = dayImpacts[day];
		if (impact === "") {
			toast.error(`Please set a market impact percentage for Day ${day}`);
			return;
		}

		// Apply the percentage change only to prices from the specified day onwards
		const updatedPriceData = editablePriceData.map((item) => {
			const multiplier = 1 + Number(impact) / 100;
			const updatedItem = { ...item };

			// Only modify prices from the specified day onwards
			if (day <= 2 && typeof item.day2Price === "number")
				updatedItem.day2Price = item.day2Price * multiplier;
			if (day <= 3 && typeof item.day3Price === "number")
				updatedItem.day3Price = item.day3Price * multiplier;
			if (day <= 4 && typeof item.day4Price === "number")
				updatedItem.day4Price = item.day4Price * multiplier;
			if (day <= 5 && typeof item.day5Price === "number")
				updatedItem.day5Price = item.day5Price * multiplier;

			return updatedItem;
		});

		setEditablePriceData(updatedPriceData);
		toast.success(
			`Market impact of ${impact}% applied from Day ${day} onwards`
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
		if (currentDay < 1 || currentDay > 6) {
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
		} else if (currentDay === 5) {
			// Advance to Day 6 (final results)
			setCurrentDay(6);

			// Optionally, reset trades left or disable further trading
			setTradesLeft({
				total: 0,
				used: 0,
			});

			// Optionally, push a final snapshot to your portfolio history here
			const finalValue = calculatePortfolioValue(
				portfolio,
				5,
				editablePriceData
			);
			const finalCash = portfolio.cash;
			const finalHoldings = finalValue - finalCash;

			// If you have a setPortfolioHistory or similar, push the final snapshot:
			// setPortfolioHistory(prev => [
			//   ...prev,
			//   {
			//     day: 6,
			//     totalValue: finalValue,
			//     cash: finalCash,
			//     holdingsValue: finalHoldings,
			//     percentChange: ...,
			//   }
			// ]);

			toast.success("Game completed! Here are your results for Day 6.");
			// Show results modal or summary if needed
		}
	};

	const addNewCompany = () => {
		const newCompanyId = `company-${Date.now()}`;
		const newCompany: Company = {
			id: newCompanyId,
			name: "New Company",
			ticker: "NEW",
			sector: "General",
			description: "Newly added company",
		};
		const newPriceData = {
			companyId: newCompanyId,
			day1Price: 0,
			day2Price: 0,
			day3Price: 0,
			day4Price: 0,
			day5Price: 0,
		};

		setEditableCompanies((prev) => [...prev, newCompany]);
		setEditablePriceData((prev) => [...prev, newPriceData]);
	};

	const handleAddCompany = () => {
		if (!newCompany.name || !newCompany.ticker || !newCompany.sector) {
			toast.error("Please fill in all required fields");
			return;
		}

		const newCompanyId = `company-${Date.now()}`;
		const companyToAdd: Company = {
			id: newCompanyId,
			name: newCompany.name,
			ticker: newCompany.ticker,
			sector: newCompany.sector,
			description: newCompany.description || "",
		};

		const newPriceData: PriceData = {
			companyId: newCompanyId,
			day1Price: 0,
			day2Price: 0,
			day3Price: 0,
			day4Price: 0,
			day5Price: 0,
		};

		setEditableCompanies((prev) => [...prev, companyToAdd]);
		setEditablePriceData((prev) => [...prev, newPriceData]);
		setIsAddCompanyModalOpen(false);
		setNewCompany({
			name: "",
			ticker: "",
			sector: "",
			description: "",
		});
		toast.success("Company added successfully");
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[95vw] md:max-w-[1200px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Game Settings</DialogTitle>
						<DialogDescription>
							Configure your game settings before starting a new
							game.
						</DialogDescription>
					</DialogHeader>

					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2 mb-4">
							<TabsTrigger value="general">
								Game Settings
							</TabsTrigger>
							<TabsTrigger value="admin">
								Admin Settings
							</TabsTrigger>
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
										min="10000"
										max="10000"
										step="10000"
										value={10000}
										readOnly
										disabled
									/>
									<p className="text-xs text-gray-500">
										This is the amount of cash you'll start
										with (minimum AED 1,000).
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
											The game simulates 5 trading days in
											the UAE stock market.
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
											The goal is to maximize your
											portfolio value by Day 5.
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

								<h3 className="font-medium mb-2">
									Market Impact
								</h3>
								<div className="space-y-2 mb-6">
									<div className="grid grid-cols-4 gap-4">
										{[2, 3, 4, 5].map((day) => (
											<div
												key={day}
												className="space-y-2"
											>
												<Label>
													Day {day} Impact (%)
												</Label>
												<div className="flex gap-2">
													<Input
														type="number"
														value={dayImpacts[day]}
														onChange={(e) =>
															handleDayImpactChange(
																day,
																e.target.value
															)
														}
														placeholder="Enter %"
													/>
													<Button
														onClick={() =>
															applyMarketImpact(
																day
															)
														}
														variant="secondary"
													>
														Apply
													</Button>
												</div>
											</div>
										))}
									</div>
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
												<th className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap">
													<Button
														onClick={() =>
															setIsAddCompanyModalOpen(
																true
															)
														}
														variant="outline"
														className="whitespace-nowrap"
													>
														Add Company
													</Button>
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-muted">
											{editableCompanies.map(
												(company) => {
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
																	value={
																		company.name
																	}
																	onChange={(
																		e
																	) =>
																		updateCompanyName(
																			company.id,
																			e
																				.target
																				.value
																		)
																	}
																	className="w-full h-8 text-sm min-w-[200px]"
																/>
															</td>
															<td className="px-4 py-2">
																<Input
																	type="text"
																	inputMode="decimal"
																	pattern="[0-9]*\.?[0-9]*"
																	value={
																		prices?.day1Price ===
																		0
																			? ""
																			: prices?.day1Price ||
																			  ""
																	}
																	onChange={(
																		e
																	) => {
																		const value =
																			e
																				.target
																				.value;
																		// Only allow numbers and decimal point
																		if (
																			value ===
																				"" ||
																			/^\d*\.?\d*$/.test(
																				value
																			)
																		) {
																			updateCompanyPrice(
																				company.id,
																				1,
																				value
																			);
																		}
																	}}
																	className="w-24 h-8 text-sm"
																	placeholder="0"
																/>
															</td>
															<td className="px-4 py-2">
																<Input
																	type="text"
																	inputMode="decimal"
																	pattern="[0-9]*\.?[0-9]*"
																	value={
																		prices?.day2Price ===
																		0
																			? ""
																			: prices?.day2Price ||
																			  ""
																	}
																	onChange={(
																		e
																	) => {
																		const value =
																			e
																				.target
																				.value;
																		// Only allow numbers and decimal point
																		if (
																			value ===
																				"" ||
																			/^\d*\.?\d*$/.test(
																				value
																			)
																		) {
																			updateCompanyPrice(
																				company.id,
																				2,
																				value
																			);
																		}
																	}}
																	className="w-24 h-8 text-sm"
																	placeholder="0"
																/>
															</td>
															<td className="px-4 py-2">
																<Input
																	type="text"
																	inputMode="decimal"
																	pattern="[0-9]*\.?[0-9]*"
																	value={
																		prices?.day3Price ===
																		0
																			? ""
																			: prices?.day3Price ||
																			  ""
																	}
																	onChange={(
																		e
																	) => {
																		const value =
																			e
																				.target
																				.value;
																		// Only allow numbers and decimal point
																		if (
																			value ===
																				"" ||
																			/^\d*\.?\d*$/.test(
																				value
																			)
																		) {
																			updateCompanyPrice(
																				company.id,
																				3,
																				value
																			);
																		}
																	}}
																	className="w-24 h-8 text-sm"
																	placeholder="0"
																/>
															</td>
															<td className="px-4 py-2">
																<Input
																	type="text"
																	inputMode="decimal"
																	pattern="[0-9]*\.?[0-9]*"
																	value={
																		prices?.day4Price ===
																		0
																			? ""
																			: prices?.day4Price ||
																			  ""
																	}
																	onChange={(
																		e
																	) => {
																		const value =
																			e
																				.target
																				.value;
																		// Only allow numbers and decimal point
																		if (
																			value ===
																				"" ||
																			/^\d*\.?\d*$/.test(
																				value
																			)
																		) {
																			updateCompanyPrice(
																				company.id,
																				4,
																				value
																			);
																		}
																	}}
																	className="w-24 h-8 text-sm"
																	placeholder="0"
																/>
															</td>
															<td className="px-4 py-2">
																<Input
																	type="text"
																	inputMode="decimal"
																	pattern="[0-9]*\.?[0-9]*"
																	value={
																		prices?.day5Price ===
																		0
																			? ""
																			: prices?.day5Price ||
																			  ""
																	}
																	onChange={(
																		e
																	) => {
																		const value =
																			e
																				.target
																				.value;
																		// Only allow numbers and decimal point
																		if (
																			value ===
																				"" ||
																			/^\d*\.?\d*$/.test(
																				value
																			)
																		) {
																			updateCompanyPrice(
																				company.id,
																				5,
																				value
																			);
																		}
																	}}
																	className="w-24 h-8 text-sm"
																	placeholder="0"
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
															<td></td>
														</tr>
													);
												}
											)}
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
				</DialogContent>
			</Dialog>
			<Dialog
				open={isAddCompanyModalOpen}
				onOpenChange={setIsAddCompanyModalOpen}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Add New Company</DialogTitle>
						<DialogDescription>
							Fill in the details for the new company.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Company Name *</Label>
							<Input
								id="name"
								value={newCompany.name}
								onChange={(e) =>
									setNewCompany((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								placeholder="Enter company name"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="ticker">Ticker Symbol *</Label>
							<Input
								id="ticker"
								value={newCompany.ticker}
								onChange={(e) =>
									setNewCompany((prev) => ({
										...prev,
										ticker: e.target.value,
									}))
								}
								placeholder="Enter ticker symbol"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="sector">Sector *</Label>
							<Input
								id="sector"
								value={newCompany.sector}
								onChange={(e) =>
									setNewCompany((prev) => ({
										...prev,
										sector: e.target.value,
									}))
								}
								placeholder="Enter sector"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={newCompany.description}
								onChange={(e) =>
									setNewCompany((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Enter company description"
								rows={3}
							/>
						</div>
					</div>
					<div className="flex justify-end space-x-2">
						<Button
							variant="outline"
							onClick={() => setIsAddCompanyModalOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleAddCompany}>Add Company</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default GameSettingsDialog;
