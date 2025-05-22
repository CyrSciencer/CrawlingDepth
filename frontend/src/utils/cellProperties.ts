import { Cell } from '../types/cell';

export const cellWall = (cell: Cell): Cell => {
  return {
    ...cell,
    isWall: true
  };
}
export const cellResource = (cell: Cell): Cell => {
  if(cell.isWall){
    return {
      ...cell,
      resources: {
        stone: 1,
        iron: 0,
        copper: 0,
        zinc: 0,
        tin: 0,
        gold: 0,
        silver: 0
      }
    };
  }
  return cell;
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

export const levelBorder = (cell: Cell): Cell => {
  if (cell.row === 0 || cell.row === 17 || cell.col === 0 || cell.col === 17) {
    const isCentralExit = 
      ((cell.row === 0 || cell.row === 17) && (cell.col >= 7 && cell.col <= 9)) ||
      ((cell.col === 0 || cell.col === 17) && (cell.row >= 7 && cell.row <= 9));

    if (!isCentralExit) {
      return {
        ...cell,
        isWall: true
      };
    }
  }
  return cell;
}

export const cellUnbreakable = (cell: Cell): Cell => {
  // Unbreakable only if both wall and exit
  if (cell.isWall && cell.isExit) {
    return {
      ...cell,
      isBreakable: false
    };
  }
  // All other cells are breakable
  return {
    ...cell,
    isBreakable: true
  };
}

export const makeCellSelectable = (cell: Cell): Cell => {
  return {
    ...cell,
    isSelectable: true
  };
}

export const getCellPriority = (cell: Cell, selectedCell?: Cell): number => {
  if (selectedCell && cell.id === selectedCell.id) return 0; // Selected cell has highest priority
  if (cell.isWall && cell.isExit && cell.isBreakable === false) return 1; // Unbreakable
  if (cell.isExit) return 2; // Exit
  if (cell.isWall) return 3; // Wall
  return 4; // Basic cells
}
    
