
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  initializeGameState, 
  initializeMarketState, 
  loadGameSettings,
  loadGameState, 
  saveGameSettings, 
  saveGameState, 
  advanceToNextDay,
  buyStock,
  sellStock,
  resetGame
} from "@/services/gameService";
import { AppState, GameSettings as GameSettingsType, GameState, MarketState } from "@/types/game.types";
import Market from "@/components/Market";
import Portfolio from "@/components/Portfolio";
import Transactions from "@/components/Transactions";
import GameHeader from "@/components/GameHeader";
import GameSettingsDialog from "@/components/GameSettings";
import GameInstructions from "@/components/GameInstructions";
import GameResults from "@/components/GameResults";
import { toast } from "sonner";

const Index = () => {
  const [appState, setAppState] = useState<AppState>({
    gameState: null,
    marketState: initializeMarketState(),
    gameSettings: loadGameSettings()
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("market");
  
  // Load saved game state on component mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      setAppState(prevState => ({
        ...prevState,
        gameState: savedState
      }));
    } else {
      // If no saved game, show settings dialog
      setIsSettingsOpen(true);
    }
  }, []);
  
  // Auto-save game state when it changes
  useEffect(() => {
    if (appState.gameState) {
      saveGameState(appState.gameState);
    }
  }, [appState.gameState]);
  
  // Show results when game is over
  useEffect(() => {
    if (appState.gameState?.isGameOver && appState.gameState.currentDay === 5) {
      setIsResultsOpen(true);
    }
  }, [appState.gameState?.isGameOver, appState.gameState?.currentDay]);
  
  // Handle starting a new game
  const handleStartGame = (startingCapital: number) => {
    const newSettings = {
      ...appState.gameSettings,
      startingCapital
    };
    
    saveGameSettings(newSettings);
    
    const newGameState = initializeGameState(newSettings);
    
    setAppState({
      gameState: newGameState,
      marketState: appState.marketState,
      gameSettings: newSettings
    });
    
    setIsSettingsOpen(false);
    toast.success("New game started with AED " + startingCapital.toFixed(2));
  };
  
  // Handle advancing to next day
  const handleAdvanceDay = () => {
    if (!appState.gameState) return;
    
    const updatedGameState = advanceToNextDay(appState.gameState, appState.marketState);
    
    setAppState(prevState => ({
      ...prevState,
      gameState: updatedGameState
    }));
  };
  
  // Handle buying stock
  const handleBuyStock = (companyId: string, shares: number) => {
    if (!appState.gameState) return;
    
    const updatedGameState = buyStock(appState.gameState, appState.marketState, companyId, shares);
    
    setAppState(prevState => ({
      ...prevState,
      gameState: updatedGameState
    }));
  };
  
  // Handle selling stock
  const handleSellStock = (companyId: string, shares: number) => {
    if (!appState.gameState) return;
    
    const updatedGameState = sellStock(appState.gameState, appState.marketState, companyId, shares);
    
    setAppState(prevState => ({
      ...prevState,
      gameState: updatedGameState
    }));
  };
  
  // Handle resetting the game
  const handleResetGame = () => {
    if (confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      const newGameState = resetGame(appState.gameSettings);
      
      setAppState(prevState => ({
        ...prevState,
        gameState: newGameState
      }));
      
      toast.success("Game has been reset");
    }
  };
  
  // Handle playing again after game over
  const handlePlayAgain = () => {
    setIsResultsOpen(false);
    setIsSettingsOpen(true);
  };
  
  // If game hasn't been started yet
  if (!appState.gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">UAE Stock Market Game</h1>
          <p className="text-gray-600">Learn about investing in the UAE stock market!</p>
          <Button onClick={() => setIsSettingsOpen(true)}>Start Game</Button>
          <GameSettingsDialog
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onStartGame={handleStartGame}
          />
        </div>
      </div>
    );
  }
  
  // Get the necessary data from gameState
  const { currentDay, portfolio, transactions, dailyTradesRemaining, isGameOver } = appState.gameState;
  const { cash, holdings } = portfolio;
  const { companies, priceData } = appState.marketState;
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        UAE Stock Market Explorer
      </h1>
      
      <GameHeader
        currentDay={currentDay}
        cash={cash}
        tradesRemaining={dailyTradesRemaining}
        isGameOver={isGameOver}
        onAdvanceDay={handleAdvanceDay}
        onShowHelp={() => setIsInstructionsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetGame={handleResetGame}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market" className="space-y-4">
          <Market
            companies={companies}
            priceData={priceData}
            currentDay={currentDay}
            transactions={transactions}
            cash={cash}
            onBuy={handleBuyStock}
            onSell={handleSellStock}
            holdings={holdings}
          />
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-4">
          <Portfolio
            gameState={appState.gameState}
            marketState={appState.marketState}
          />
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          <Transactions
            transactions={transactions}
            companies={companies}
          />
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <GameSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onStartGame={handleStartGame}
        startingCapital={appState.gameSettings.startingCapital}
      />
      
      <GameInstructions
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
      
      <GameResults
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        onPlayAgain={handlePlayAgain}
        gameState={appState.gameState}
        marketState={appState.marketState}
      />
    </div>
  );
};

export default Index;
