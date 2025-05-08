
import { Company, PriceData } from "../types/game.types";

export const sampleCompanies: Company[] = [
  {
    id: "EMAAR",
    name: "Emaar Properties",
    ticker: "EMAAR",
    sector: "Real Estate",
    description: "Leading global property developer and provider of premium lifestyles, with a presence in 36 markets across the Middle East."
  },
  {
    id: "DIB",
    name: "Dubai Islamic Bank",
    ticker: "DIB",
    sector: "Banking",
    description: "First Islamic bank in the UAE offering Sharia-compliant products and services."
  },
  {
    id: "DFM",
    name: "Dubai Financial Market",
    ticker: "DFM",
    sector: "Financial Services",
    description: "Dubai's main stock exchange established in 2000 as a public institution with its own independent corporate body."
  },
  {
    id: "EMIRATES",
    name: "Emirates NBD",
    ticker: "EMIRATES",
    sector: "Banking",
    description: "One of the largest banking groups in the Middle East in terms of assets."
  },
  {
    id: "ETISALAT",
    name: "Etisalat UAE",
    ticker: "ETISALAT",
    sector: "Telecommunications",
    description: "Leading telecommunications provider in the UAE offering mobile and fixed-line services."
  },
  {
    id: "DAMAC",
    name: "Damac Properties",
    ticker: "DAMAC",
    sector: "Real Estate",
    description: "Luxury real estate developer focusing on high-end properties across the UAE and international markets."
  },
  {
    id: "ADNOC",
    name: "ADNOC Distribution",
    ticker: "ADNOC",
    sector: "Energy",
    description: "Leading fuel distributor in the UAE with a network of service stations across the country."
  },
  {
    id: "ARAMEX",
    name: "Aramex",
    ticker: "ARAMEX",
    sector: "Logistics",
    description: "Global provider of comprehensive logistics and transportation solutions."
  },
  {
    id: "ALDAR",
    name: "Aldar Properties",
    ticker: "ALDAR",
    sector: "Real Estate",
    description: "Abu Dhabi's leading property development, management and investment company."
  },
  {
    id: "ENBD",
    name: "Emirates NBD REIT",
    ticker: "ENBD",
    sector: "Real Estate Investment Trust",
    description: "First Shari'a compliant Real Estate Investment Trust listed on NASDAQ Dubai."
  }
];

export const samplePriceData: PriceData[] = [
  {
    companyId: "EMAAR",
    day1Price: 5.72,
    day2Price: 5.85,
    day3Price: 5.93,
    day4Price: 5.79,
    day5Price: 6.04
  },
  {
    companyId: "DIB",
    day1Price: 4.89,
    day2Price: 4.95,
    day3Price: 5.12,
    day4Price: 5.08,
    day5Price: 5.24
  },
  {
    companyId: "DFM",
    day1Price: 1.44,
    day2Price: 1.47,
    day3Price: 1.43,
    day4Price: 1.38,
    day5Price: 1.42
  },
  {
    companyId: "EMIRATES",
    day1Price: 13.65,
    day2Price: 13.80,
    day3Price: 13.95,
    day4Price: 14.25,
    day5Price: 14.10
  },
  {
    companyId: "ETISALAT",
    day1Price: 17.52,
    day2Price: 17.48,
    day3Price: 17.86,
    day4Price: 17.92,
    day5Price: 18.15
  },
  {
    companyId: "DAMAC",
    day1Price: 1.28,
    day2Price: 1.32,
    day3Price: 1.27,
    day4Price: 1.25,
    day5Price: 1.30
  },
  {
    companyId: "ADNOC",
    day1Price: 4.15,
    day2Price: 4.22,
    day3Price: 4.30,
    day4Price: 4.18,
    day5Price: 4.28
  },
  {
    companyId: "ARAMEX",
    day1Price: 3.75,
    day2Price: 3.82,
    day3Price: 3.78,
    day4Price: 3.90,
    day5Price: 3.86
  },
  {
    companyId: "ALDAR",
    day1Price: 3.92,
    day2Price: 4.08,
    day3Price: 4.15,
    day4Price: 4.10,
    day5Price: 4.22
  },
  {
    companyId: "ENBD",
    day1Price: 0.85,
    day2Price: 0.83,
    day3Price: 0.86,
    day4Price: 0.88,
    day5Price: 0.90
  }
];
