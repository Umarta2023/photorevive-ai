export interface PresetPrompt {
  id: string;
  prompt: string;
}

export interface ResultItem {
  id: string;
  imageUrl: string;
  prompt: string;
  mimeType: string;
}

export type ComparisonMode = 'slider' | 'side';

export interface Pan {
  x: number;
  y: number;
}

export type PromptMode = 'retouch' | 'reimagine';

export interface CreditPackage {
    credits: number;
    price: number;
}

export interface User {
  name: string;
  credits: number;
  referralCode: string;
  referralCount: number;
}