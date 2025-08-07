import { MathPair, GameSettings } from '../types';

export class MathGenerator {
  private static getDifficultyRange(difficulty: GameSettings['difficulty']): number[] {
    switch (difficulty) {
      case 'easy':
        return [2, 3, 4, 5];
      case 'medium':
        return [6, 7, 8, 9];
      case 'expert':
        return [2, 3, 4, 5, 6, 7, 8, 9];
      default:
        return [2, 3, 4, 5];
    }
  }

  static generatePairs(settings: GameSettings, count: number = 10): MathPair[] {
    const range = this.getDifficultyRange(settings.difficulty);
    const pairs: MathPair[] = [];
    const used = new Set<string>();

    while (pairs.length < count) {
      const a = range[Math.floor(Math.random() * range.length)];
      const b = range[Math.floor(Math.random() * range.length)];
      
      let example: string;
      let answer: number;
      
      if (settings.operation === 'multiplication') {
        example = `${a}×${b}`;
        answer = a * b;
      } else {
        // Для деления используем произведение как делимое
        const dividend = a * b;
        example = `${dividend}÷${b}`;
        answer = a;
      }

      const key = `${example}-${answer}`;
      
      if (!used.has(key)) {
        used.add(key);
        pairs.push({
          id: `pair-${pairs.length}`,
          example,
          answer: answer.toString()
        });
      }
    }

    return pairs;
  }

  static validatePair(example: string, answer: string): boolean {
    if (example.includes('×')) {
      const [a, b] = example.split('×').map(n => parseInt(n.trim()));
      return (a * b) === parseInt(answer);
    } else if (example.includes('÷')) {
      const [dividend, divisor] = example.split('÷').map(n => parseInt(n.trim()));
      return (dividend / divisor) === parseInt(answer);
    }
    return false;
  }
}