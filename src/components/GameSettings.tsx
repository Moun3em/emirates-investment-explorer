
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { Company, PriceData } from '@/types/game.types';

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (startingCapital: number, tradesPerDay: number) => void;
  startingCapital?: number;
  companies?: Company[];
  priceData?: PriceData[];
  onUpdateCompanies?: (companies: Company[]) => void;
  onUpdatePriceData?: (priceData: PriceData[]) => void;
}

const GameSettingsDialog = ({ 
  isOpen, 
  onClose, 
  onStartGame, 
  startingCapital = 10000,
  companies = [],
  priceData = [],
  onUpdateCompanies,
  onUpdatePriceData 
}: GameSettingsProps) => {
  const [capital, setCapital] = useState<number>(startingCapital);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [activeTab, setActiveTab] = useState<string>("general");
  
  // For company editing
  const [editableCompanies, setEditableCompanies] = useState<Company[]>(companies);
  const [editablePriceData, setEditablePriceData] = useState<PriceData[]>(priceData);
  
  const difficultyToTradesMap = {
    easy: 3,
    medium: 6,
    hard: 9
  };

  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCapital(isNaN(value) || value <= 0 ? 1000 : value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame(capital, difficultyToTradesMap[difficulty as keyof typeof difficultyToTradesMap]);
    
    // If admin settings were changed, update them
    if (activeTab === "admin" && onUpdateCompanies && onUpdatePriceData) {
      onUpdateCompanies(editableCompanies);
      onUpdatePriceData(editablePriceData);
    }
  };
  
  const updateCompanyName = (companyId: string, name: string) => {
    setEditableCompanies(prev => 
      prev.map(company => 
        company.id === companyId ? { ...company, name } : company
      )
    );
  };
  
  const updateCompanyPrice = (companyId: string, day: number, price: number) => {
    setEditablePriceData(prev => 
      prev.map(item => {
        if (item.companyId === companyId) {
          const updatedItem = { ...item };
          if (day === 1) updatedItem.day1Price = price;
          else if (day === 2) updatedItem.day2Price = price;
          else if (day === 3) updatedItem.day3Price = price;
          else if (day === 4) updatedItem.day4Price = price;
          else if (day === 5) updatedItem.day5Price = price;
          return updatedItem;
        }
        return item;
      })
    );
  };
  
  const removeCompany = (companyId: string) => {
    setEditableCompanies(prev => prev.filter(company => company.id !== companyId));
    setEditablePriceData(prev => prev.filter(item => item.companyId !== companyId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Configure your game settings before starting a new game.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="general">Game Settings</TabsTrigger>
            <TabsTrigger value="admin">Admin Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
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
              
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div className="control w-full max-w-xs mx-auto mt-2">
                  <div className="control__track bg-muted rounded-full p-1 relative h-10">
                    <div className="indicator absolute w-1/3 h-[calc(100%-8px)] bg-primary rounded-full transition-transform duration-300 top-1" 
                         style={{ 
                           transform: difficulty === "easy" ? "translateX(0%)" : 
                                     difficulty === "medium" ? "translateX(100%)" : "translateX(200%)" 
                         }}></div>
                    <ToggleGroup 
                      type="single" 
                      value={difficulty} 
                      onValueChange={(value) => value && setDifficulty(value)}
                      className="grid grid-cols-3 h-full relative z-10"
                    >
                      <ToggleGroupItem value="easy" className="rounded-full h-full">Easy</ToggleGroupItem>
                      <ToggleGroupItem value="medium" className="rounded-full h-full">Medium</ToggleGroupItem>
                      <ToggleGroupItem value="hard" className="rounded-full h-full">Hard</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {difficulty === "easy" ? "3 trades per day" : 
                   difficulty === "medium" ? "6 trades per day" : 
                   "9 trades per day"}
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Game Rules:</p>
                <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>The game simulates 5 trading days in the UAE stock market.</li>
                  <li>You can make up to {difficultyToTradesMap[difficulty as keyof typeof difficultyToTradesMap]} trades per day.</li>
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
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-4">Edit Companies & Prices</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium">Company</th>
                      <th className="px-2 py-2 text-left text-xs font-medium">Day 1</th>
                      <th className="px-2 py-2 text-left text-xs font-medium">Day 2</th>
                      <th className="px-2 py-2 text-left text-xs font-medium">Day 3</th>
                      <th className="px-2 py-2 text-left text-xs font-medium">Day 4</th>
                      <th className="px-2 py-2 text-left text-xs font-medium">Day 5</th>
                      <th className="px-2 py-2 text-left text-xs font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {editableCompanies.map(company => {
                      const prices = editablePriceData.find(data => data.companyId === company.id);
                      return (
                        <tr key={company.id}>
                          <td className="px-2 py-2">
                            <Input 
                              value={company.name} 
                              onChange={(e) => updateCompanyName(company.id, e.target.value)}
                              className="w-full h-8 text-sm"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              value={prices?.day1Price || 0}
                              onChange={(e) => updateCompanyPrice(company.id, 1, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              value={prices?.day2Price || 0}
                              onChange={(e) => updateCompanyPrice(company.id, 2, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              value={prices?.day3Price || 0}
                              onChange={(e) => updateCompanyPrice(company.id, 3, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              value={prices?.day4Price || 0}
                              onChange={(e) => updateCompanyPrice(company.id, 4, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              value={prices?.day5Price || 0}
                              onChange={(e) => updateCompanyPrice(company.id, 5, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => removeCompany(company.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save & Start Game</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsDialog;
