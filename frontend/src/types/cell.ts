export interface Cell {
  id: string;
  row: number;
  col: number;
  isWall?: boolean;
  isExit?: boolean;
} 