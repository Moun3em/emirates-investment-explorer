
import { Circle } from "lucide-react";

interface TradeDotsProps {
	total: number;
	used: number;
}

const TradeDots: React.FC<TradeDotsProps> = ({ total, used }) => {
	const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
	const safeUsed = Number.isFinite(used) && used >= 0 ? used : 0;

	return (
		<div className="flex items-center gap-1">
			{Array.from({ length: safeTotal }).map((_, index) => (
				<Circle
					key={index}
					className={`h-2 w-2 ${
						index < safeUsed ? "fill-violet-400" : "stroke-gray-300"
					}`}
				/>
			))}
		</div>
	);
};

export default TradeDots;
