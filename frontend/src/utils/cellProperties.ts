import { Cell } from '../types/cell';

export const cellWall = (cell: Cell): Cell => {
  return {
    ...cell,
    isWall: true
  };
}

export const cellExit = (cell: Cell): Cell => {
    if (cell.row === 0 || cell.row === 17 || cell.col === 0 || cell.col === 17) {
        return {
            ...cell,
            isExit: true
        };
    }
    return cell;
}
