export class Maze {
    constructor(dimension, app) {
      this.mazeMap = Maze.mazeGen2D(dimension);
      this.heightChart = Maze.moduleToMap(this.mazeMap, dimension);
      this.theL = Maze.pushAllUp(this.mazeMap, dimension);
      this.mazeMapO = this.mazeMap;
      this.dimension = dimension;
  
      const theLT = Maze.deepsort(this.theL);
      const [ladderE, ladderW, ladderN, ladderS] = Maze.getLadder(
        this.mazeMap,
        this.heightChart,
        dimension
      );
      const result = Maze.blocksAddIn(
        theLT,
        this.mazeMap,
        this.heightChart,
        ladderE,
        ladderW,
        ladderN,
        ladderS,
        dimension
      );
      [this.theL, this.ladderE, this.ladderW, this.ladderN, this.ladderS] = result;
      this.theL = Maze.deepsort(this.theL);
    }
  
    static mazeGen2D(dimension) {
      const mazeMap0 = Maze.mazeGen2DHelper(dimension);
      const mazeMap1 = {};
      for (const [cell, value] of Object.entries(mazeMap0)) {
        const [y, x] = cell.split(',').map(Number);
        mazeMap1[[x, dimension - y - 1]] = value;
      }
      return mazeMap1;
    }
  
    static mazeGen2DHelper(dimension, start = [0, 0]) {
      const directions = [
        [0, 1, 'E'], [0, -1, 'W'], [-1, 0, 'N'], [1, 0, 'S']
      ];
      const opposite = { E: 'W', W: 'E', N: 'S', S: 'N' };
      const mazeMap = {};
      for (let x = 0; x < dimension; x++) {
        for (let y = 0; y < dimension; y++) {
          mazeMap[[x, y]] = { E: 0, W: 0, N: 0, S: 0 };
        }
      }
  
      const visited = new Set();
      const stack = [start];
      visited.add(start.toString());
  
      while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const neighbors = directions
          .map(([dx, dy, dir]) => [x + dx, y + dy, dir])
          .filter(([nx, ny]) =>
            nx >= 0 && ny >= 0 && nx < dimension && ny < dimension &&
            !visited.has([nx, ny].toString())
          );
  
        if (neighbors.length > 0) {
          const [nx, ny, dir] = neighbors[Math.floor(Math.random() * neighbors.length)];
          mazeMap[[x, y]][dir] = 1;
          mazeMap[[nx, ny]][opposite[dir]] = 1;
          visited.add([nx, ny].toString());
          stack.push([nx, ny]);
        } else {
          stack.pop();
        }
      }
  
      return mazeMap;
    }
  
    static pushAllUp(mazeMap, dimension) {
      return Maze.finalConvertion(Maze.moduleToMap(mazeMap, dimension));
    }
  
    static finalConvertion(heightChart) {
      const L = [];
      for (const [t, c] of Object.entries(heightChart)) {
        const [a, b] = t.split(',').map(Number);
        L.push([a, b, c]);
      }
      return L;
    }
  
    static moduleToMap(mazeMap, dimension) {
      const newMap = { ...mazeMap };
      return Maze.moduleToMapHelper(newMap, {}, dimension);
    }
  
    static moduleToMapHelper(newMap, heightChart, dimension) {
      if (Object.keys(newMap).length === 0) return heightChart;
      for (let i = 0; i < dimension; i++) {
        for (let t = 0; t < dimension; t++) {
          const cell = [i, t];
          if (!(cell in newMap)) continue;
          const code = newMap[cell];
          const height = Maze.getHeight(cell, code, heightChart, dimension);
          if (height != null && Maze.isLegalMove(cell, code, heightChart, height)) {
            heightChart[cell] = height;
            delete newMap[cell];
            const solution = Maze.moduleToMapHelper(newMap, heightChart, dimension);
            if (solution != null) return solution;
            newMap[cell] = code;
            delete heightChart[cell];
          }
        }
      }
      return null;
    }
  
    static isLegalMove(cell, code, heightChart, height) {
      let count = 0;
      const [x, y] = cell;
      for (const dir in code) {
        const dxdy = { E: [1, 0], W: [-1, 0], N: [0, 1], S: [0, -1] };
        const [dx, dy] = dxdy[dir];
        const check = [x + dx, y + dy].toString();
        const heightCheck = heightChart[check];
        if (code[dir] === 0 && heightCheck === height) count++;
        if (code[dir] === 1 && heightCheck != null && heightCheck !== height && Math.abs(heightCheck - height) !== 1) count++;
      }
      return count <= 2;
    }
  
    static getHeight(cell, code, heightChart, dimension) {
      if (cell.toString() === '0,0') return 0;
      const [x, y] = cell;
      const dxdy = { E: [1, 0], W: [-1, 0], N: [0, 1], S: [0, -1] };
  
      for (const dir in code) {
        if (code[dir] === 0) {
          const [dx, dy] = dxdy[dir];
          const check = [x + dx, y + dy].toString();
          const heightCheck = heightChart[check];
          if (heightCheck != null) {
            return heightCheck >= Math.floor(dimension / 2) ? heightCheck - 1 : heightCheck + 1;
          }
        }
      }
  
      for (const dir in code) {
        if (code[dir] === 1) {
          const [dx, dy] = dxdy[dir];
          const check = [x + dx, y + dy].toString();
          const heightCheck = heightChart[check];
          if (heightCheck != null) return heightCheck;
        }
      }
  
      return null;
    }
  
    static deepsort(L) {
      const X = [...L];
      X.sort((a, b) => a[2] - b[2]);
      const z1 = X[0][2];
      const z2 = X[X.length - 1][2];
      const R = [];
      for (let z = z1; z <= z2; z++) {
        const T = X.filter(([_, __, h]) => h === z)
          .sort((a, b) => b[1] - a[1])
          .sort((a, b) => b[0] - a[0]);
        R.push(...T);
      }
      return R;
    }
  
    // getLadder and blocksAddIn stay the same (can be ported similarly)

    // Maze.js (append these static methods inside the Maze class)

    static getLadder(mazeMap, heightChart, dimension) {
        const ladderW = new Set();
        const ladderS = new Set();
        const ladderE = new Set();
        const ladderN = new Set();
    
        for (const coordinate in mazeMap) {
        const [x, y] = coordinate.split(',').map(Number);
        const height = heightChart[`${x},${y}`];
        const code = mazeMap[coordinate];
    
        for (const direction in code) {
            if (code[direction] === 1) {
            let checkX = x, checkY = y, dirCode;
            if (direction === 'E') [checkX, dirCode] = [x + 1, 1];
            else if (direction === 'W') [checkX, dirCode] = [x - 1, 2];
            else if (direction === 'N') [checkY, dirCode] = [y + 1, 3];
            else if (direction === 'S') [checkY, dirCode] = [y - 1, 4];
    
            const heightCheck = heightChart[`${checkX},${checkY}`];
            if (heightCheck != null) {
                if (heightCheck - height === 1) {
                const key = `${checkX},${checkY},${heightCheck}`;
                if (dirCode === 1) ladderW.add(key);
                if (dirCode === 2) ladderE.add(key);
                if (dirCode === 3) ladderS.add(key);
                if (dirCode === 4) ladderN.add(key);
                } else if (heightCheck - height === -1) {
                const key = `${x},${y},${height}`;
                if (dirCode === 1) ladderE.add(key);
                if (dirCode === 2) ladderW.add(key);
                if (dirCode === 3) ladderN.add(key);
                if (dirCode === 4) ladderS.add(key);
                }
            }
            }
        }
        }
        return [ladderE, ladderW, ladderN, ladderS];
    }
    
    static blocksAddIn(theL, mazeMap, heightChart, ladderE, ladderW, ladderN, ladderS, dimension) {
        for (const coordinate in mazeMap) {
          const [x, y] = coordinate.split(',').map(Number);
          const height = heightChart[`${x},${y}`];
          const code = mazeMap[coordinate];
      
          for (const direction in code) {
            if (code[direction] === 1) {
              let checkX = x, checkY = y, dirCode;
              if (direction === 'E') [checkX, checkY, dirCode] = [x + 1, y, 1];
              else if (direction === 'W') [checkX, checkY, dirCode] = [x - 1, y, 2];
              else if (direction === 'N') [checkX, checkY, dirCode] = [x, y + 1, 3];
              else if (direction === 'S') [checkX, checkY, dirCode] = [x, y - 1, 4];
      
              const heightCheck = heightChart[`${checkX},${checkY}`];
              if (heightCheck != null) {
                if (heightCheck - height > 1) {
                  // Higher to lower
                  const top = [checkX, checkY, heightCheck];
                  theL.push(top);
                  const setKey = `${checkX},${checkY},${heightCheck}`;
                  if (dirCode === 1) ladderW.add(setKey);
                  if (dirCode === 2) ladderE.add(setKey);
                  if (dirCode === 3) ladderS.add(setKey);
                  if (dirCode === 4) ladderN.add(setKey);
      
                  for (let i = 1; i < heightCheck - height; i++) {
                    const interBlock = [checkX, checkY, heightCheck - i];
                    theL.push(interBlock);
                    const interKey = `${checkX},${checkY},${heightCheck - i}`;
                    if (dirCode === 1) ladderW.add(interKey);
                    if (dirCode === 2) ladderE.add(interKey);
                    if (dirCode === 3) ladderS.add(interKey);
                    if (dirCode === 4) ladderN.add(interKey);
                  }
                } else if (heightCheck - height < -1) {
                  // Lower to higher
                  const top = [x, y, height];
                  theL.push(top);
                  const setKey = `${x},${y},height`;
                  if (dirCode === 1) ladderE.add(setKey);
                  if (dirCode === 2) ladderW.add(setKey);
                  if (dirCode === 3) ladderN.add(setKey);
                  if (dirCode === 4) ladderS.add(setKey);
      
                  for (let i = 1; i < height - heightCheck; i++) {
                    const interBlock = [x, y, height - i];
                    theL.push(interBlock);
                    const interKey = `${x},${y},${height - i}`;
                    if (dirCode === 1) ladderE.add(interKey);
                    if (dirCode === 2) ladderW.add(interKey);
                    if (dirCode === 3) ladderN.add(interKey);
                    if (dirCode === 4) ladderS.add(interKey);
                  }
                }
              }
            }
          }
        }
      
        return [theL, ladderE, ladderW, ladderN, ladderS];
      }
      
  }
  