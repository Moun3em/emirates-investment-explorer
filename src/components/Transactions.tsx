
import React from 'react';
import { Transaction, Company } from '@/types/game.types';
import { Card } from '@/components/ui/card';

interface TransactionsProps {
  transactions: Transaction[];
  companies: Company[];
  onlyLatest?: boolean;
}

const Transactions = ({ transactions, companies, onlyLatest = false }: TransactionsProps) => {
  // Sort transactions by timestamp, newest first
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  
  // Only show latest 5 transactions if onlyLatest is true
  const displayedTransactions = onlyLatest 
    ? sortedTransactions.slice(0, 5) 
    : sortedTransactions;
  
  // Helper to find company name by ID
  const getCompanyName = (id: string): string => {
    const company = companies.find(c => c.id === id);
    return company ? company.name : id;
  };
  
  // Helper to get transaction date
  const getTransactionDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  if (displayedTransactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No transactions recorded yet.</p>
      </Card>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shares
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Day
            </th>
            {!onlyLatest && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayedTransactions.map((transaction) => {
            const total = transaction.shares * transaction.price;
            const isBuy = transaction.type === 'buy';
            
            return (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      isBuy
                        ? 'bg-game-purple-light text-game-purple-dark'
                        : 'bg-game-peach text-orange-700'
                    }`}
                  >
                    {isBuy ? 'BUY' : 'SELL'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCompanyName(transaction.companyId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {transaction.shares.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {transaction.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                  {isBuy ? '-' : '+'}{total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  Day {transaction.day}
                </td>
                {!onlyLatest && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {getTransactionDate(transaction.timestamp)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
