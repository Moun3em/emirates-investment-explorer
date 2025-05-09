import TradeDots from "./TradeDots";
import { useState, useEffect } from "react";

interface DashboardProps {
	startingCapital: number;
	tradesPerDay: number;
	difficulty?: string;
}

const Dashboard: React.FC<DashboardProps> = ({
	startingCapital,
	tradesPerDay,
}) => {
	const [tradesLeft, setTradesLeft] = useState({
		total: tradesPerDay,
		used: 0,
	});

	useEffect(() => {
		setTradesLeft({
			total: tradesPerDay,
			used: 0,
		});
	}, [tradesPerDay]);

	return (
		<div>
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium">Trades Left Today:</span>
				<TradeDots total={tradesLeft.total} used={tradesLeft.used} />
			</div>
		</div>
	);
};

export default Dashboard;
