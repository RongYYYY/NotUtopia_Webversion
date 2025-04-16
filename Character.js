import { getBlockLFD } from './geometryUtils.js';
import { Maze } from './Maze.js';
import {
  drawBlock,
  drawStarterBlockTop,
  drawLadder
} from './renderUtils.js';

export class Character {
  constructor(app) {
    this.app = app;
    const dimension = app.map.dimension;
    for (const [a, b, c] of app.map.theL) {
      if (a === 0 && b === dimension - 1) {
        this.zBlock = c;
      }
    }
    this.xBoard = app.blockSize / 2;
    this.yBoard = (dimension - 1) * app.blockSize + app.blockSize / 2;
    this.spriteFrame = 0;
    this.spriteTimer = 0;
    this.frameSpeed = 4; // ms per frame
    this.direction = 'idle';

    this.updateValues();
    [this.xCoo, this.yCoo] = getBlockLFD(app, this.x, this.y, this.z);

    this.sprites = {
      N: this.loadSprites("MN", 6),
      E: this.loadSprites("ME", 6),
      S: this.loadSprites("MS", 6),
      W: this.loadSprites("MW", 6),
      idle: this.loadSprites("MSS", 1),
      win: this.loadSprites("MWin", 6),
      climb: this.loadSprites("ML", 1)
    };
  }

  loadSprites(prefix, count) {
    const images = [];
    for (let i = 1; i <= count; i++) {
      const img = new Image();
      img.src = `./assets/sprites/${prefix}${i}.PNG`;
      images.push(img);
    }
    return images;
  }

  update() {
    this.spriteTimer += 1;
    if (this.spriteTimer >= this.frameSpeed) {
      this.spriteFrame = (this.spriteFrame + 1) % this.sprites[this.direction].length;
      this.spriteTimer = 0;
    }
  }

  updateValues() {
    this.xBlock = Math.floor(this.xBoard / this.app.blockSize);
    this.yBlock = Math.floor(this.yBoard / this.app.blockSize);
    this.x = this.xBoard / this.app.blockSize;
    this.y = this.yBoard / this.app.blockSize;
    this.z = this.zBlock + 1.5;
  }

  move(direction) {
    const amount = this.app.dimension / 5 + 1.5;
    switch (direction) {
      case 'E': this.xBoard += amount; break;
      case 'W': this.xBoard -= amount; break;
      case 'N': this.yBoard += amount; break;
      case 'S': this.yBoard -= amount; break;
    }
    this.app.charStatus = direction;
    this.direction = direction;
    this.playFootSound();
    this.updateValues();
    [this.xCoo, this.yCoo] = getBlockLFD(this.app, this.x, this.y, this.z);
  }

  moveVertical(direction) {
    const dz = 0.01 * this.app.dimension;
    this.zBlock += direction === 'up' ? dz : -dz;
    this.app.charStatus = direction;
    this.direction = 'climb';
    this.playFootSound();
    this.updateValues();
    [this.xCoo, this.yCoo] = getBlockLFD(this.app, this.x, this.y, this.z);
  }

  movable() {
    const { xBlock, yBlock, zBlock, app } = this;
    const dirs = [ [1, 0], [-1, 0], [0, 1], [0, -1] ];
    const L = [[xBlock, yBlock, zBlock]];
    for (const [dx, dy] of dirs) {
      const x = xBlock + dx;
      const y = yBlock + dy;
      const h = app.map.heightChart[`${x},${y}`];
      if (h !== undefined && Math.abs(h - zBlock) < 0.005) {
        L.push([x, y, h]);
      }
    }
    return L;
  }

  playFootSound() {
    if (this.app.footSound && !this.app.footSound.playing) {
      this.app.footSound.loop = true;
      // this.app.footSound.play();
    }
  }

  downable() {
    const app = this.app;
    const xB = this.xBlock;
    const yB = this.yBlock;
    const bSize = app.blockSize;
  
    const ex = xB + 1, ey = yB;
    const wx = xB - 1, wy = yB;
    const nx = xB, ny = yB + 1;
    const sx = xB, sy = yB - 1;
  
    const ez = app.map.heightChart[`${ex},${ey}`];
    const wz = app.map.heightChart[`${wx},${wy}`];
    const nz = app.map.heightChart[`${nx},${ny}`];
    const sz = app.map.heightChart[`${sx},${sy}`];
  
    // Ladder E
    for (const key of app.ladderE) {
      const [a, b, c] = key.split(',').map(Number);
      if (xB === a && yB === b && ez !== undefined) {
        const pixelOffset = this.xBoard - xB * bSize;
        if (pixelOffset > bSize - 10) {
          app.eastLadder = true;
          return [ex, ey, ez];
        }
      }
    }
  
    // Ladder W
    for (const key of app.ladderW) {
      const [a, b, c] = key.split(',').map(Number);
      if (xB === a && yB === b && wz !== undefined) {
        const pixelOffset = this.xBoard - xB * bSize;
        if (pixelOffset < 10) {
          app.eastLadder = app.northLadder = false;
          return [wx, wy, wz];
        }
      }
    }
  
    // Ladder S
    for (const key of app.ladderS) {
      const [a, b, c] = key.split(',').map(Number);
      if (xB === a && yB === b && sz !== undefined) {
        const pixelOffset = this.yBoard - yB * bSize;
        if (pixelOffset < 10) {
          app.eastLadder = app.northLadder = false;
          return [sx, sy, sz];
        }
      }
    }
  
    // Ladder N
    for (const key of app.ladderN) {
      const [a, b, c] = key.split(',').map(Number);
      if (xB === a && yB === b && nz !== undefined) {
        const pixelOffset = this.yBoard - yB * bSize;
        if (pixelOffset > bSize - 10) {
          app.northLadder = true;
          return [nx, ny, nz];
        }
      }
    }
  
    return false;
  }
  

  upable() {
    const app = this.app;
    const blockSize = app.blockSize;
  
    const ex = this.xBlock + 1, ey = this.yBlock;
    const wx = this.xBlock - 1, wy = this.yBlock;
    const nx = this.xBlock, ny = this.yBlock + 1;
    const sx = this.xBlock, sy = this.yBlock - 1;
  
    const ez = app.map.heightChart[`${ex},${ey}`];
    const wz = app.map.heightChart[`${wx},${wy}`];
    const nz = app.map.heightChart[`${nx},${ny}`];
    const sz = app.map.heightChart[`${sx},${sy}`];
  
    if (ez !== undefined && app.ladderW.has(`${ex},${ey},${ez}`)) {
      if (this.xBoard - this.xBlock * blockSize > blockSize - 10) {
        app.eastLadder = false;
        app.northLadder = false;
        return [ex, ey, ez];
      }
    }
  
    if (wz !== undefined && app.ladderE.has(`${wx},${wy},${wz}`)) {
      if (this.xBoard - this.xBlock * blockSize < 10) {
        app.eastLadder = true;
        return [wx, wy, wz];
      }
    }
  
    if (sz !== undefined && app.ladderN.has(`${sx},${sy},${sz}`)) {
      if (this.yBoard - this.yBlock * blockSize < 10) {
        app.northLadder = true;
        return [sx, sy, sz];
      }
    }
  
    if (nz !== undefined && app.ladderS.has(`${nx},${ny},${nz}`)) {
      if (this.yBoard - this.yBlock * blockSize > blockSize - 10) {
        app.eastLadder = false;
        app.northLadder = false;
        return [nx, ny, nz];
      }
    }
  
    return false;
  }
  

  getMoreL(T) {
    const sorted = Maze.deepsort(T); // ensure sorted by depth
    const L = [];
    for (const [a, b, c] of sorted) {
      if (this.xBlock >= a && this.yBlock >= b && c > this.zBlock) {
        L.push([a, b, c]);
      }
    }
    return L;
  }
  
  drawMoreL(T) {
    const C = this.getMoreL(T);
    for (const [a, b, c] of C) {
      drawBlock(this.app, a, b, c, this.app.blockSize);
      if ((a === this.app.dimension - 1 && b === 0) || (a === 0 && b === this.app.dimension - 1)) {
        drawStarterBlockTop(this.app, a, b, c, this.app.blockSize);
      }
      if (this.app.ladderW.has(`${a},${b},${c}`)) {
        drawLadder(this.app, a, b, c, this.app.blockSize, 'L');
      }
      if (this.app.ladderS.has(`${a},${b},${c}`)) {
        drawLadder(this.app, a, b, c, this.app.blockSize, 'R');
      }
    }
  }
  
  screenPosition() {
    return [this.xCoo, this.yCoo];
  }

  draw(ctx) {
    const spriteList = this.sprites[this.direction] || this.sprites.idle;
    const currentSprite = spriteList[this.spriteFrame % spriteList.length];
    const [x, y] = this.screenPosition();
    ctx.drawImage(currentSprite, x - 35, y - 36, 75, 75);
  }
}
