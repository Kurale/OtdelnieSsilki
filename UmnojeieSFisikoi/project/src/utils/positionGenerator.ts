import { Position } from '../types';

export class PositionGenerator {
  private static readonly CONTAINER_WIDTH = 600;
  private static readonly CONTAINER_HEIGHT = 600;
  private static readonly ELEMENT_SIZE = 100;
  private static readonly MARGIN = 20;

  static generateRandomPositions(count: number): Position[] {
    const positions: Position[] = [];
    const usedPositions = new Set<string>();

    while (positions.length < count) {
      const left = Math.floor(Math.random() * 
        (this.CONTAINER_WIDTH - this.ELEMENT_SIZE - 2 * this.MARGIN)) + this.MARGIN;
      const top = Math.floor(Math.random() * 
        (this.CONTAINER_HEIGHT - this.ELEMENT_SIZE - 2 * this.MARGIN)) + this.MARGIN;
      
      const posKey = `${Math.floor(left / 50)}-${Math.floor(top / 50)}`;
      
      if (!usedPositions.has(posKey)) {
        usedPositions.add(posKey);
        positions.push({ left, top });
      }
    }

    return positions;
  }

  static isValidDistance(pos1: Position, pos2: Position, minDistance: number = 120): boolean {
    const dx = pos1.left - pos2.left;
    const dy = pos1.top - pos2.top;
    return Math.sqrt(dx * dx + dy * dy) >= minDistance;
  }
}