
import React from 'react';
import { Company } from '@/types/game.types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

interface CompanyDetailsProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

const CompanyDetails = ({ company, isOpen, onClose }: CompanyDetailsProps) => {
  if (!company) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {company.name} ({company.ticker})
          </SheetTitle>
          <SheetDescription>
            {company.sector}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium">About</h4>
            <p className="text-gray-600 mt-1">{company.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium">Investment Tips</h4>
            <ul className="text-gray-600 mt-1 space-y-2 list-disc list-inside">
              {company.id === "EMAAR" && (
                <>
                  <li>Real estate companies often perform well during economic growth.</li>
                  <li>Consider how tourism trends impact Emaar's hospitality businesses.</li>
                </>
              )}
              {company.id === "DIB" && (
                <>
                  <li>Banks are sensitive to interest rate changes.</li>
                  <li>Islamic banking follows different principles than conventional banking.</li>
                </>
              )}
              {company.id === "ETISALAT" && (
                <>
                  <li>Telecommunications companies often provide stable dividends.</li>
                  <li>Consider how new technologies might impact their business.</li>
                </>
              )}
              {company.id === "ADNOC" && (
                <>
                  <li>Energy companies are affected by global oil prices.</li>
                  <li>Consider how green energy trends might impact oil companies.</li>
                </>
              )}
              {company.sector === "Real Estate" && (
                <>
                  <li>Real estate performs differently in various economic conditions.</li>
                  <li>Consider population growth and tourism in the UAE.</li>
                </>
              )}
              {company.sector === "Banking" && (
                <>
                  <li>Banks benefit from higher interest rates.</li>
                  <li>Economic growth usually helps banking stocks perform well.</li>
                </>
              )}
              <li>Diversify your investments across different sectors.</li>
              <li>Consider both short-term price movements and long-term potential.</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyDetails;
