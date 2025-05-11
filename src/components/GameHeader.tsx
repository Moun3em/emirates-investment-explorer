import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Info } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import ResetGameDialog from "./ResetGameDialog";
import { useState } from "react";
import toast from "react-hot-toast";

interface GameHeaderProps {
	currentDay: number;
	cash: number;
	tradesRemaining: number;
	isGameOver: boolean;
	onAdvanceDay: () => void;
	onShowHelp: () => void;
	onResetGame: () => void;
	onShowResults: () => void;
	onStopGame: () => void;
}

const GameHeader = ({
	currentDay,
	cash,
	tradesRemaining,
	isGameOver,
	onAdvanceDay,
	onShowHelp,
	onResetGame,
	onShowResults,
	onStopGame,
}: GameHeaderProps) => {
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

	const advanceToNextDay = () => {
		if (currentDay < 5) {
			onAdvanceDay();
			toast.success(`Advanced to Day ${currentDay + 1}`);
		} else if (currentDay === 5) {
			onAdvanceDay();
			toast.success("Game completed! Here are your results.");
			onShowResults();
		}
	};

	const handleResetClick = () => {
		setIsResetDialogOpen(true);
	};

	const handleResetConfirm = () => {
		onResetGame();
		setIsResetDialogOpen(false);
		toast.success("Game has been reset");
	};

	const maxTrades = Math.max(tradesRemaining, 3);
	const safeTrades =
		Number.isFinite(tradesRemaining) && tradesRemaining > 0
			? tradesRemaining
			: 0;

	return (
		<>
			<div className="bg-white shadow rounded-lg p-4 mb-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div className="flex flex-wrap items-center gap-4">
						<div className="flex items-center">
							<Badge
								variant="outline"
								className="text-lg font-semibold px-3 py-1"
							>
								Day {currentDay}/5
							</Badge>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={onShowHelp}
											className="ml-2"
										>
											<Info className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Game help and instructions</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<Separator
							orientation="vertical"
							className="h-6 hidden md:block"
						/>

						<div className="flex items-center gap-2">
							<div>
								<span className="text-sm text-gray-500">
									Cash
								</span>
								<p className="font-semibold">
									AED {cash.toFixed(2)}
								</p>
							</div>
						</div>

						<Separator
							orientation="vertical"
							className="h-6 hidden md:block"
						/>

						<div>
							<span className="text-sm text-gray-500">
								Trades Left Today
							</span>
							<div className="flex items-center gap-1">
								{Array.from({ length: maxTrades }).map(
									(_, i) => (
										<div
											key={i}
											className={
												i < safeTrades
													? "w-2 h-2 rounded-full bg-game-purple animate-pulse-light"
													: "w-2 h-2 rounded-full bg-gray-400 opacity-50"
											}
										/>
									)
								)}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2 w-full md:w-auto">
						<Button
							variant="outline"
							size="sm"
							className="flex-1 md:flex-none"
							onClick={handleResetClick}
						>
							Reset Game
						</Button>
						<Button
							variant="secondary"
							size="sm"
							className="flex-1 md:flex-none"
							onClick={onStopGame}
							disabled={isGameOver}
						>
							Stop Game
						</Button>
						<Button
							className="flex-1 md:flex-none"
							onClick={advanceToNextDay}
							disabled={isGameOver}
						>
							{isGameOver ? "Game Complete" : "Next Day"}
							{!isGameOver && (
								<ChevronDown className="ml-1 h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</div>

			<ResetGameDialog
				isOpen={isResetDialogOpen}
				onClose={() => setIsResetDialogOpen(false)}
				onConfirm={handleResetConfirm}
			/>
		</>
	);
};

export default GameHeader;
