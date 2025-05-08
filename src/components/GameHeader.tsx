
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ChevronDown, Info, Settings } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GameHeaderProps {
  currentDay: number;
  cash: number;
  tradesRemaining: number;
  isGameOver: boolean;
  onAdvanceDay: () => void;
  onShowHelp: () => void;
  onOpenSettings: () => void;
  onResetGame: () => void;
}

const GameHeader = ({
  currentDay,
  cash,
  tradesRemaining,
  isGameOver,
  onAdvanceDay,
  onShowHelp,
  onOpenSettings,
  onResetGame,
}: GameHeaderProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
              Day {currentDay}/5
            </Badge>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onShowHelp} className="ml-2">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Game help and instructions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          
          <div className="flex items-center gap-2">
            <DollarSign className="text-gray-500 h-4 w-4" />
            <div>
              <span className="text-sm text-gray-500">Cash</span>
              <p className="font-semibold">AED {cash.toFixed(2)}</p>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          
          <div>
            <span className="text-sm text-gray-500">Trades Left Today</span>
            <div className="flex items-center gap-1">
              {[...Array(tradesRemaining)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-game-purple animate-pulse-light"
                />
              ))}
              {[...Array(3 - tradesRemaining)].map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="w-2 h-2 rounded-full bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 md:flex-none"
            onClick={onResetGame}
          >
            Reset Game
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 md:flex-none"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          
          <Button
            className="flex-1 md:flex-none"
            onClick={onAdvanceDay}
            disabled={isGameOver}
          >
            {isGameOver ? "Game Complete" : "Next Day"}
            {!isGameOver && <ChevronDown className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
