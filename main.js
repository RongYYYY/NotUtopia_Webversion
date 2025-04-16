// main.js (cleaned and refactored)
import { Maze } from './Maze.js';
import { Character } from './Character.js';
import { state } from './state.js';
import {
  getBlockLFD,
  drawBlock,
  drawStarterBlockTop,
  drawLadder,
  drawSunnyModeInstructions, 
  drawMiniMap,
  drawKeyInstruction, 
  drawBackButton,
  drawWinMap
} from './renderUtils.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keysHeld = new Set();

window.addEventListener('keydown', function(e) {
    const keysToBlock = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    if (keysToBlock.includes(e.key)) {
      e.preventDefault(); // This stops the page from scrolling
    }
  });  

window.addEventListener("keydown", (e) => {
  keysHeld.add(e.key.toLowerCase());
});

window.addEventListener("keyup", (e) => {
  keysHeld.delete(e.key.toLowerCase());
  state.app.char.direction = "idle";
  if (state.app.win) {
    state.app.char.direction = "win";
  }
});


function getTheme() {
  return state.selectedColor || state.colorThemes[state.colorTheme];
}

function gameLoop(timestamp) {
    const app = state.app;
    if (state.currentScreen === "game" && app) {
      onKeyHold(app, keysHeld); // 
      drawGameScreen();         // then render updated state
      app.char.update();
    } else {
      drawStartScreen();
    }
  
    requestAnimationFrame(gameLoop);
  }
  

function drawStartScreen() {
  const theme = getTheme();
  ctx.fillStyle = theme.sBackgroundC;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = theme.sWordsC;
  ctx.font = "48px Kefa";
  ctx.textAlign = "center";
  ctx.fillText("not UTOPIA", canvas.width / 2, 100);

  drawButton(160, 260, 200, 60, "Schenley", state.colorTheme === 1);
  drawButton(400, 260, 200, 60, "Allegheny", state.colorTheme === 2);
  drawButton(630, 260, 200, 60, "Squirrel Hill", state.colorTheme === 3);

  drawButton(160, 370, 200, 60, "Sunny", state.selectedMode === "sunny");
  drawButton(400, 370, 200, 60, "Foggy", state.selectedMode === "foggy");

  drawButton(160, 480, 200, 60, "6 x 6", state.selectedDimension === 6);
  drawButton(400, 480, 200, 60, "8 x 8", state.selectedDimension === 8);
  drawButton(630, 480, 200, 60, "10 x 10", state.selectedDimension === 10);

  if (state.selectedMode && state.selectedDimension) {
    drawButton(630, 350, 240, 100, "START", false);
  }
}

function drawButton(x, y, width, height, text, selected) {
  const theme = getTheme();
  ctx.fillStyle = selected ? theme.sWordsC : theme.sCubeLC;
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = theme.sLineC;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = theme.sBackgroundC;
  ctx.font = "24px Kefa";
  ctx.textAlign = "center";
  ctx.fillText(text, x + width / 2, y + height / 2 + 8);
}

function drawGameScreen() {
  if (!state.app) return;
  if (state.app.win) {
    drawGameScene(state.app);
    state.app.char.draw(ctx);
    drawWinMap(state.app, ctx);
  } else {
  drawGameScene(state.app);
  state.app.char.draw(ctx);
  //console.log(state.app.char.xBlock, state.app.char.yBlock, state.app.char.zBlock, state.app.char.x, state.app.char.y);
  state.app.char.drawMoreL(state.app.map.theL);
  drawSunnyModeInstructions(state.app);
  drawMiniMap(state.app, ctx);
  drawKeyInstruction(state.app, ctx);
  drawBackButton(state.app, ctx);
  }
}

canvas.addEventListener("mousedown", ({ offsetX: x, offsetY: y }) => {
  if (state.currentScreen !== "start") return;

  if (x >= 160 && x <= 360 && y >= 260 && y <= 320) state.colorTheme = 1;
  if (x >= 400 && x <= 600 && y >= 260 && y <= 320) state.colorTheme = 2;
  if (x >= 630 && x <= 830 && y >= 260 && y <= 320) state.colorTheme = 3;

  if (x >= 160 && x <= 360 && y >= 370 && y <= 430) state.selectedMode = "sunny";
  if (x >= 400 && x <= 600 && y >= 370 && y <= 430) state.selectedMode = "foggy";

  if (x >= 160 && x <= 360 && y >= 480 && y <= 540) state.selectedDimension = 6;
  if (x >= 400 && x <= 600 && y >= 480 && y <= 540) state.selectedDimension = 8;
  if (x >= 630 && x <= 830 && y >= 480 && y <= 540) state.selectedDimension = 10;

  if (state.selectedMode && state.selectedDimension && x >= 630 && x <= 870 && y >= 350 && y <= 450) {
    startGame();
  }
});

canvas.addEventListener("mousedown", ({ offsetX: x, offsetY: y }) => {
    if (state.currentScreen === "game") {
      // Check if Back Button is clicked
      if (x >= 50 && x <= 250 && y >= 30 && y <= 110) {
        state.currentScreen = "start";
        return;
      }
    }
  
    // (rest of your start screen click handling here)
  });
  

function startGame() {
  const app = {};
  app.map = new Maze(state.selectedDimension);
  app.dimension = state.selectedDimension;
  app.mode = state.selectedMode;
  app.color = getTheme();
  app.blockSize = 35;
  app.mazeLFDX = app.mode === 'foggy' ? 700 - app.dimension*16 : 600 - app.dimension*16;
  app.mazeLFDY = 480 + app.dimension*10;
  app.ladderE = app.map.ladderE;
  app.ladderW = app.map.ladderW;
  app.ladderN = app.map.ladderN;
  app.ladderS = app.map.ladderS;
  app.charStatus = null;
  app.spriteCounter = 0;
  app.coins = getCoins(app);
  app.gotCoins = [];
  app.char = new Character(app);
  state.app = app;
  state.currentScreen = "game";
  app.sunnyMode = app.mode === "sunny";
}

function getCoins(app) {
  const L = [];
  while (L.length < app.dimension - 3) {
    const x = Math.floor(Math.random() * app.dimension);
    const y = Math.floor(Math.random() * app.dimension);
    if ((x === 0 && y === app.dimension - 1) || (x === app.dimension - 1 && y === 0)) continue;
    if (!L.some(coord => coord[0] === x && coord[1] === y)) L.push([x, y]);
  }
  return L;
}

function drawGameScene(app) {
  ctx.fillStyle = app.color.sBackgroundC;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const sortedL = Maze.deepsort(app.map.theL);
  for (const [a, b, c] of sortedL) {
    drawBlock(app, a, b, c, app.blockSize);
    if ((a === app.dimension - 1 && b === 0) || (a === 0 && b === app.dimension - 1)) {
      drawStarterBlockTop(app, a, b, c, app.blockSize);
    }
    if (app.ladderW.has(`${a},${b},${c}`)) drawLadder(app, a, b, c, app.blockSize, 'L');
    if (app.ladderS.has(`${a},${b},${c}`)) drawLadder(app, a, b, c, app.blockSize, 'R');
  }
}

// JS version of sunnyHorizontalMove
function sunnyHorizontalMove(app, keys, L) {
    if (keys.has("arrowup")) {
      app.char.move("N");
      if (!L.some(([x, y, z]) => x === app.char.xBlock && y === app.char.yBlock && z === app.char.zBlock)) {
        app.char.move("S");
        app.charStatus = null;
      }
    } else if (keys.has("arrowdown")) {
      app.char.move("S");
      if (!L.some(([x, y, z]) => x === app.char.xBlock && y === app.char.yBlock && z === app.char.zBlock)) {
        app.char.move("N");
        app.charStatus = null;
      }
    } else if (keys.has("arrowright")) {
      app.char.move("E");
      if (!L.some(([x, y, z]) => x === app.char.xBlock && y === app.char.yBlock && z === app.char.zBlock)) {
        app.char.move("W");
        app.charStatus = null;
      }
    } else if (keys.has("arrowleft")) {
      app.char.move("W");
      if (!L.some(([x, y, z]) => x === app.char.xBlock && y === app.char.yBlock && z === app.char.zBlock)) {
        app.char.move("E");
        app.charStatus = null;
      }
    }
  }
  
  // JS version of verticalMove
  function verticalMove(app, keys) {
    const upable = app.char.upable();
    const downable = app.char.downable();
  
    if (upable) {
      const [a, b, c] = upable;
      if (keys.has(" ") && keys.has("arrowup")) {
        app.char.moveVertical("up");
        if (app.char.zBlock - c > 0) {
          app.char.xBoard += (a * app.blockSize + 0.5 * app.blockSize - app.char.xBoard) / 3;
          app.char.yBoard += (b * app.blockSize + 0.5 * app.blockSize - app.char.yBoard) / 3;
          app.char.zBlock = c;
          app.eastLadder = app.northLadder = false;
        }
      }
      if (keys.has(" ") && keys.has("arrowdown")) {
        app.char.moveVertical("down");
        const groundZ = app.map.heightChart[`${app.char.xBlock},${app.char.yBlock}`];
        if (app.char.zBlock < groundZ) {
          app.char.zBlock = groundZ;
          app.eastLadder = app.northLadder = false;
        }
      }
    }
  
    if (downable) {
      const [a, b, c] = downable;
      if (keys.has(" ") && keys.has("arrowdown")) {
        app.char.xBoard += (a * app.blockSize + 0.5 * app.blockSize - app.char.xBoard) / 3;
        app.char.yBoard += (b * app.blockSize + 0.5 * app.blockSize - app.char.yBoard) / 3;
        app.char.moveVertical("down");
      }
    }
  
    if (!upable && !downable) {
      app.eastLadder = app.northLadder = false;
    }
  }
  
  // Call this in onKeyHold
  function onKeyHold(app, keys) {
    if (!app.win && app.sunnyMode) {
      const L = app.char.movable();
      verticalMove(app, keys);
      if (app.char.zBlock % 1 === 0) {
        sunnyHorizontalMove(app, keys, L);
      }
  
      const coinKey = `${app.char.xBlock},${app.char.yBlock}`;
      if (app.coins.some(([x, y]) => x === app.char.xBlock && y === app.char.yBlock) &&
          !app.gotCoins.some(([x, y]) => x === app.char.xBlock && y === app.char.yBlock)) {
        // app.sunSound.play();
        app.gotCoins.push([app.char.xBlock, app.char.yBlock]);
      }
      checkWin(app);
    }
  }

  function checkWin(app) {
    const x = app.char.xBoard;
    const y = app.char.yBoard;
    const bs = app.blockSize;
    const dim = app.dimension;
  
    const inGoalX = x > dim * bs - 4 / 5 * bs && x < dim * bs - 1 / 5 * bs;
    const inGoalY = y > 1 / 5 * bs && y < 4 / 5 * bs;
  
    if (inGoalX && inGoalY && app.mode === "sunny") {
      if (app.gotCoins.length === dim - 3) {
        app.win = true;
        app.charStatus = "win";
        // if (app.winSound && !app.winSound.playing) {
        //   app.winSound.play();
        // }
      }
    }
  }
  
  
  

gameLoop();