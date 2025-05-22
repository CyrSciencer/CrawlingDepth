export interface Cell {
  id?: string;
  row: number;
  col: number;
  x?: number;
  y?: number;
  type?: 'wall' | 'floor' | 'exit' | 'unbreakable';
  isWall?: boolean;
  isExit?: boolean;
  isBreakable?: boolean;
  isSelectable?: boolean;
  resources?: {
    stone: number;
    iron: number;
    copper: number;
    zinc: number;
    tin: number;
    gold: number;
    silver: number;
  };
  modifiedAt?: Date;
}
