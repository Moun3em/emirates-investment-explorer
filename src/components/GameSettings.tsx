
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (startingCapital: number) => void;
  startingCapital?: number;
}

const GameSettings = ({ isOpen, onClose, onStartGame, startingCapital = 10000 }: GameSettingsProps) => {
  const [capital, setCapital] = useState<number>(startingCapital);

  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCapital(isNaN(value) || value <= 0 ? 1000 : value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame(capital);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Configure your game settings before starting a new game.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="startingCapital">Starting Capital (AED)</Label>
            <Input
              id="startingCapital"
              type="number"
              min="1000"
              step="1000"
              value={capital}
              onChange={handleCapitalChange}
            />
            <p className="text-xs text-gray-500">
              This is the amount of cash you'll start with (minimum AED 1,000).
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Game Rules:</p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>The game simulates 5 trading days in the UAE stock market.</li>
              <li>You can make up to 3 trades per day.</li>
              <li>Prices change daily based on market conditions.</li>
              <li>You can buy fractional shares.</li>
              <li>The goal is to maximize your portfolio value by Day 5.</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Start Game</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettings;
