import React, { useState } from "react";
import { Company, PriceData, Transaction } from "@/types/game.types";
import StockChart from "./StockChart";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getStockPrice } from "@/services/gameService";

interface MarketProps {
	companies: Company[];
	priceData: PriceData[];
	currentDay: number;
	transactions: Transaction[];
	cash: number;
	onBuy: (companyId: string, shares: number) => void;
	onSell: (companyId: string, shares: number) => void;
	holdings: { companyId: string; shares: number }[];
}

const Market = ({
	companies,
	priceData,
	currentDay,
	transactions,
	cash,
	onBuy,
	onSell,
	holdings,
}: MarketProps) => {
	const [selectedCompany, setSelectedCompany] = useState<string>(
		companies[0]?.id || ""
	);
	const [shares, setShares] = useState<number>(1);

	const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value);
		setShares(isNaN(value) || value <= 0 ? 1 : value);
	};

	const handleCompanySelect = (value: string) => {
		setSelectedCompany(value);
	};

	const getSharesOwned = (companyId: string) => {
		const holding = holdings.find((h) => h.companyId === companyId);
		return holding ? holding.shares : 0;
	};

	const renderPriceChange = (companyId: string) => {
		const today = getStockPrice(companyId, currentDay, priceData);
		const yesterday =
			currentDay > 1
				? getStockPrice(companyId, currentDay - 1, priceData)
				: null;

		if (!today || !yesterday) return null;

		const change = ((today - yesterday) / yesterday) * 100;
		const isPositive = change >= 0;

		return (
			<div
				className={`flex items-center ${
					isPositive ? "text-profit" : "text-loss"
				}`}
			>
				{isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
				<span>{Math.abs(change).toFixed(2)}%</span>
			</div>
		);
	};

	const getCurrentCompanyInfo = () => {
		const company = companies.find((c) => c.id === selectedCompany);
		if (!company) return null;

		const price = getStockPrice(company.id, currentDay, priceData) || 0;
		const sharesOwned = getSharesOwned(company.id);
		const totalCost = price * shares;

		return { company, price, sharesOwned, totalCost };
	};

	const info = getCurrentCompanyInfo();
	const maxAffordableShares = info ? Math.floor(cash / info.price) : 0;

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row gap-4">
				<div className="w-full md:w-2/3">
					<StockChart
						companyId={selectedCompany}
						currentDay={currentDay}
						priceData={priceData}
						transactions={transactions}
					/>
				</div>

				<div className="w-full md:w-1/3">
					<Card className="h-full p-4">
						<div className="flex flex-col h-full">
							<h3 className="text-lg font-semibold mb-4">
								Trade
							</h3>

							<div className="space-y-4 flex-grow">
								<div className="space-y-2">
									<label className="block text-sm">
										Select Company
									</label>
									<Select
										value={selectedCompany}
										onValueChange={handleCompanySelect}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select company" />
										</SelectTrigger>
										<SelectContent>
											{companies.map((company) => (
												<SelectItem
													key={company.id}
													value={company.id}
												>
													{company.name} (
													{company.ticker})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{info && (
									<div className="space-y-4">
										<div>
											<p className="text-sm">
												Current Price:
											</p>
											<p className="text-lg font-bold">
												AED {info.price.toFixed(2)}
											</p>
											{renderPriceChange(selectedCompany)}
										</div>

										<div>
											<p className="text-sm">You Own:</p>
											<p>
												{info.sharesOwned.toFixed(2)}{" "}
												shares
											</p>
										</div>

										<div className="space-y-2">
											<label className="block text-sm">
												Amount to Trade
											</label>
											<Input
												type="number"
												min="0.01"
												step="0.01"
												value={shares}
												onChange={handleSharesChange}
											/>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => setShares(1)}
												>
													Min
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														// For Buy: set max affordable shares
														// For Sell: set max owned shares
														const sellMode =
															info.sharesOwned >
															0;
														const max = sellMode
															? info.sharesOwned
															: maxAffordableShares;
														setShares(
															max > 0 ? max : 1
														);
													}}
												>
													Max
												</Button>
											</div>
										</div>

										<div>
											<p className="text-sm">
												Total Cost:
											</p>
											<p className="text-lg font-bold">
												AED {info.totalCost.toFixed(2)}
											</p>
										</div>

										<div className="flex gap-2 mt-4">
											<Button
												className="flex-1"
												onClick={() =>
													onBuy(
														selectedCompany,
														shares
													)
												}
												disabled={info.totalCost > cash}
											>
												Buy
											</Button>
											<Button
												className="flex-1"
												variant="outline"
												onClick={() =>
													onSell(
														selectedCompany,
														shares
													)
												}
												disabled={
													shares > info.sharesOwned
												}
											>
												Sell
											</Button>
										</div>
									</div>
								)}
							</div>
						</div>
					</Card>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Market Overview</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Company
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Sector
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Price (AED)
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Change
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									You Own
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Value
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{companies.map((company) => {
								const price =
									getStockPrice(
										company.id,
										currentDay,
										priceData
									) || 0;
								const sharesOwned = getSharesOwned(company.id);
								const holdingValue = price * sharesOwned;

								return (
									<tr
										key={company.id}
										className={`hover:bg-gray-50 cursor-pointer ${
											selectedCompany === company.id
												? "bg-gray-100"
												: ""
										}`}
										onClick={() =>
											setSelectedCompany(company.id)
										}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="font-medium text-gray-900">
												{company.name}
											</div>
											<div className="text-gray-500 text-sm">
												{company.ticker}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-gray-500">
											{company.sector}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
											{price.toFixed(2)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right">
											{renderPriceChange(company.id)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
											{sharesOwned > 0
												? sharesOwned.toFixed(2)
												: "-"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
											{sharesOwned > 0
												? holdingValue.toFixed(2)
												: "-"}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default Market;
