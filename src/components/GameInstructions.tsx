
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface GameInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameInstructions = ({ isOpen, onClose }: GameInstructionsProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">UAE Stock Market Game Instructions</DialogTitle>
          <DialogDescription>
            Learn how to play the UAE stock market simulation game
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
          <div>
            <h3 className="text-lg font-bold">Game Overview</h3>
            <p className="text-gray-600">
              This game simulates trading stocks in the UAE market over 5 days. Your goal is to maximize
              your portfolio value by buying and selling stocks strategically.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">How to Play</h3>
            
            <div>
              <h4 className="font-medium">1. Game Structure</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
                <li>The game lasts for 5 trading days.</li>
                <li>Each day, you can make up to 3 trades (buy or sell).</li>
                <li>Stock prices change each day.</li>
                <li>Use the "Next Day" <ChevronDown className="inline h-4 w-4" /> button to advance to the next day.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">2. Market View</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
                <li>View stock prices and daily changes.</li>
                <li>Click on a company to select it for trading.</li>
                <li>Green percentages <ArrowUp className="inline h-4 w-4 text-profit" /> indicate price increases.</li>
                <li>Red percentages <ArrowDown className="inline h-4 w-4 text-loss" /> indicate price decreases.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">3. Trading</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
                <li>Select a company from the dropdown or market table.</li>
                <li>Enter the number of shares you want to buy or sell.</li>
                <li>You can buy fractional shares (e.g., 0.5 shares).</li>
                <li>Click "Buy" to purchase shares using your cash.</li>
                <li>Click "Sell" to sell shares you own and receive cash.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">4. Portfolio</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
                <li>Track your cash, holdings, and total portfolio value.</li>
                <li>View performance charts showing your portfolio growth.</li>
                <li>Monitor your daily and overall profit/loss.</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Key Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center"><DollarSign className="h-4 w-4 mr-1" /> Cash Management</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Monitor your available cash at the top of the screen. Make sure you have enough
                  to buy the shares you want.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center">📊 Price Charts</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Interactive charts show price movements for each stock. Green and red dots indicate
                  your buy and sell points.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center">📝 Transaction History</h4>
                <p className="text-gray-600 text-sm mt-1">
                  View your trading history to analyze your decisions and learn from them.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center">🏆 Results Analysis</h4>
                <p className="text-gray-600 text-sm mt-1">
                  After 5 days, get detailed analytics on your performance, best trades,
                  and tips for improvement.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-bold">Investing Tips</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
              <li><span className="font-medium">Diversify:</span> Invest in different sectors to reduce risk.</li>
              <li><span className="font-medium">Watch trends:</span> Look for patterns in price movements.</li>
              <li><span className="font-medium">Balance risk:</span> Higher potential returns often come with higher risk.</li>
              <li><span className="font-medium">Plan ahead:</span> Consider how many trading days remain when making decisions.</li>
              <li><span className="font-medium">Learn from results:</span> Use the end-of-game analysis to improve your strategy.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameInstructions;
