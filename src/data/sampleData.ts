
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
    day2Price: 9.3,
    day3Price: 2.54,
    day4Price: 3.59,
    day5Price: 4.49
  },
  {
    companyId: "DIB",
    day1Price: 4.89,
    day2Price: 5.38,
    day3Price: 1.61,
    day4Price: 2.25,
    day5Price: 1.98
  },
  {
    companyId: "DFM",
    day1Price: 1.44,
    day2Price: 1.58,
    day3Price: 0.47,
    day4Price: 0.66,
    day5Price: 0.58
  },
  {
    companyId: "EMIRATES",
    day1Price: 13.65,
    day2Price: 15.29,
    day3Price: 3.82,
    day4Price: 5.35,
    day5Price: 4.71
  },
  {
    companyId: "ETISALAT",
    day1Price: 17.52,
    day2Price: 17.87,
    day3Price: 5.36,
    day4Price: 5.79,
    day5Price: 5.1
  },
  {
    companyId: "DAMAC",
    day1Price: 1.28,
    day2Price: 2.4,
    day3Price: 0.69,
    day4Price: 0.83,
    day5Price: 1.04
  },
  {
    companyId: "ADNOC",
    day1Price: 4.15,
    day2Price: 4.19,
    day3Price: 2.72,
    day4Price: 5.98,
    day5Price: 5.26
  },
  {
    companyId: "ARAMEX",
    day1Price: 3.75,
    day2Price: 4.01,
    day3Price: 0.62,
    day4Price: 3.15,
    day5Price: 5.36
  },
  {
    companyId: "ALDAR",
    day1Price: 3.92,
    day2Price: 7.8,
    day3Price: 1.03,
    day4Price: 1.8,
    day5Price: 2.24
  },
  {
    companyId: "ENBD",
    day1Price: 0.85,
    day2Price: 0.98,
    day3Price: 0.24,
    day4Price: 0.41,
    day5Price: 0.51
  }
];
