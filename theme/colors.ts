export interface Theme {
  background: string;
  display: string;
  currentText: string;
  expressionText: string;
  numberBtn: string;
  operatorBtn: string;
  functionBtn: string;
  numberText: string;
  operatorText: string;
  functionText: string;
  scientificBtn: string;
  scientificText: string;
  historyBg: string;
  historyText: string;
  historySubText: string;
  separator: string;
}

export const THEMES: Record<'dark' | 'light', Theme> = {
  dark: {
    background: '#000000',
    display: '#000000',
    currentText: '#ffffff',
    expressionText: '#888888',
    numberBtn: '#333333',
    operatorBtn: '#ff9f0a',
    functionBtn: '#a5a5a5',
    numberText: '#ffffff',
    operatorText: '#ffffff',
    functionText: '#000000',
    scientificBtn: '#1c1c1e',
    scientificText: '#ffffff',
    historyBg: '#1c1c1e',
    historyText: '#ffffff',
    historySubText: '#888888',
    separator: '#333333',
  },
  light: {
    background: '#f2f2f7',
    display: '#f2f2f7',
    currentText: '#000000',
    expressionText: '#666666',
    numberBtn: '#ffffff',
    operatorBtn: '#ff9f0a',
    functionBtn: '#d4d4d2',
    numberText: '#000000',
    operatorText: '#ffffff',
    functionText: '#000000',
    scientificBtn: '#e5e5ea',
    scientificText: '#000000',
    historyBg: '#ffffff',
    historyText: '#000000',
    historySubText: '#666666',
    separator: '#d4d4d2',
  },
};