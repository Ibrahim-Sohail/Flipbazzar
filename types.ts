export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface User {
  name: string;
  email: string;
  preferences?: string[]; 
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  specs: string;
  rating: number;
  imageUrl: string;
  inStock: boolean;
  tags: string[]; // Added for better search matching
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  relatedProducts?: Product[];
  timestamp: Date;
}

export interface SearchParams {
  query?: string;
  category?: string;
  maxPrice?: number;
}