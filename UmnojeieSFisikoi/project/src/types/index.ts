export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'expert';
  operation: 'multiplication' | 'division';
}

export interface MathPair {
  answer: string;
  example: string;
  id: string;
}

export interface GameElement {
  id: string;
  value: string;
  type: 'answer' | 'example';
  position: { x: number; y: number };
  body?: any;
  element?: HTMLElement;
}

export interface GameStats {
  correct: number;
  incorrect: number;
  totalPairs: number;
  startTime: number;
}

export interface Position {
  left: number;
  top: number;
}