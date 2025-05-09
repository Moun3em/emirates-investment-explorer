import * as React from "react";
import { useState } from "react";
import GameSettingsDialog from "./GameSettings";
import Dashboard from "./Dashboard";

const Game = () => {
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [gameSettings, setGameSettings] = useState({
		startingCapital: 10000,
		tradesPerDay: 3,
		difficulty: "easy",
	});

	const handleStartGame = (
		startingCapital: number,
		tradesPerDay: number,
		difficulty: string
	) => {
		setGameSettings({
			startingCapital,
			tradesPerDay,
			difficulty,
		});
		setIsGameStarted(true);
	};

	return (
		<div>
			{!isGameStarted ? (
				<GameSettingsDialog
					isOpen={true}
					onClose={() => {}} // No-op is fine
					onStartGame={handleStartGame}
				/>
			) : (
				<Dashboard
					startingCapital={gameSettings.startingCapital}
					tradesPerDay={gameSettings.tradesPerDay}
					difficulty={gameSettings.difficulty}
				/>
			)}
		</div>
	);
};

export default Game;
