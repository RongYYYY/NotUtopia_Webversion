// renderUtils.js
import { getBlockLFD } from './geometryUtils.js';

const ctx = document.getElementById("gameCanvas").getContext("2d");

export function drawPolygon(...pointsAndOptions) {
  const options = typeof pointsAndOptions[pointsAndOptions.length - 1] === 'object'
    ? pointsAndOptions.pop()
    : {};
  const points = pointsAndOptions;

  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i], points[i + 1]);
  }
  ctx.closePath();

  if (options.fill) {
    ctx.fillStyle = options.fill;
    ctx.globalAlpha = options.opacity || 1.0;
    ctx.fill();
    ctx.globalAlpha = 1.0; // reset opacity
  }

  if (options.stroke) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = options.strokeWidth || 2;
    ctx.stroke();
  }
}

export function drawLine(x1, y1, x2, y2, color = 'black', lineWidth = 1, opacity = 1.0) {
    const ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = opacity;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

export function drawLabel(text, x, y, options = {}) {
    const { fill = 'black', size = 20, align = 'center', bold = false, opacity = 1.0, font = 'Arial', rotateAngle = 0} = options;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = fill;
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.restore();
    ctx.rotateAngle = rotateAngle || 0;
  }
  
  export function drawRect(x, y, width, height, options = {}) {
    const ctx = document.getElementById("gameCanvas").getContext("2d");
  
    ctx.beginPath();
    ctx.rect(x, y, width, height);
  
    if (options.fill) {
      ctx.fillStyle = options.fill;
      ctx.globalAlpha = options.opacity || 1.0;
      ctx.fill();
      ctx.globalAlpha = 1.0; // reset opacity
    }
  
    if (options.border) {
      ctx.strokeStyle = options.border;
      ctx.lineWidth = options.borderWidth || 2;
      ctx.stroke();
    }
  }

  export function drawCircle(x, y, radius, options = {}) {
    const ctx = document.getElementById("gameCanvas").getContext("2d");
  
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
  
    if (options.fill) {
      ctx.fillStyle = options.fill;
      ctx.globalAlpha = options.opacity || 1.0;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  
    if (options.border) {
      ctx.strokeStyle = options.border;
      ctx.lineWidth = options.borderWidth || 2;
      ctx.stroke();
    }
  }

  export function drawBackButton(app, ctx) {
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = app.color.sCubeFC;
    ctx.strokeStyle = app.color.sLineC;
    ctx.lineWidth = 4;
    ctx.fillRect(50, 30, 200, 80);
    ctx.strokeRect(50, 30, 200, 80);
    ctx.globalAlpha = 1.0;
  
    drawLabel("To Main", 150, 80, {
      fill: app.color.sWordsC,
      size: 40,
      font: "Kefa",
      bold: true
    }, ctx);
  }

  export function drawWinMap(app, ctx) {
    drawLabel('You Made It!', 600, 350, {
      fill: app.color.sWordsC,
      size: 130,
      align: 'center',
      font: 'Kefa',
      bold: true
    }, ctx);
  }
  
  
  
function drawBlock(app, x, y, z, size) {
  const [LFDX, LFDY] = getBlockLFD(app, x, y, z);
  const [LFUX, LFUY] = getBlockLFD(app, x, y, z + 1);
  const [RFDX, RFDY] = getBlockLFD(app, x + 1, y, z);
  const [RFUX, RFUY] = getBlockLFD(app, x + 1, y, z + 1);
  const [LBDX, LBDY] = getBlockLFD(app, x, y + 1, z);
  const [LBUX, LBUY] = getBlockLFD(app, x, y + 1, z + 1);
  const [RBDX, RBDY] = getBlockLFD(app, x + 1, y + 1, z);
  const [RBUX, RBUY] = getBlockLFD(app, x + 1, y + 1, z + 1);

  // Front
  drawPolygon(LFDX, LFDY, LFUX, LFUY, RFUX, RFUY, RFDX, RFDY, {
    fill: app.color.sCubeFC,
    stroke: app.color.sLineC,
    strokeWidth: 2
  });
  // Left
  drawPolygon(LFDX, LFDY, LFUX, LFUY, LBUX, LBUY, LBDX, LBDY, {
    fill: app.color.sCubeLC,
    stroke: app.color.sLineC,
    strokeWidth: 2
  });
  // Top
  drawPolygon(LFUX, LFUY, RFUX, RFUY, RBUX, RBUY, LBUX, LBUY, {
    fill: app.color.sCubeTC,
    stroke: app.color.sLineC,
    strokeWidth: 2
  });
}

function drawStarterBlockTop(app, x, y, z, size) {
  const [LFUX, LFUY] = getBlockLFD(app, x, y, z + 1);
  const [RFUX, RFUY] = getBlockLFD(app, x + 1, y, z + 1);
  const [LBUX, LBUY] = getBlockLFD(app, x, y + 1, z + 1);
  const [RBUX, RBUY] = getBlockLFD(app, x + 1, y + 1, z + 1);

  drawPolygon(LFUX, LFUY, RFUX, RFUY, RBUX, RBUY, LBUX, LBUY, {
    fill: app.color.sWordsC,
    stroke: app.color.sLineC,
    strokeWidth: 1.5
  });
  // Additional decorations (dots)
  // Skipping detail polygons for now
}

function drawLadder(app, x, y, z, size, direction) {
    if (direction === 'L') {
      const [blockLFDX, blockLFDY] = getBlockLFD(app, x, y, z);
      const [blockLFUX, blockLFUY] = getBlockLFD(app, x, y, z + 1);
      const [blockLBDX, blockLBDY] = getBlockLFD(app, x, y + 1, z);
      const [blockLBUX, blockLBUY] = getBlockLFD(app, x, y + 1, z + 1);
  
      const ladderLFDX = blockLFDX - (blockLFDX - blockLBDX) / 4;
      const ladderLFDY = blockLFDY - (blockLFDY - blockLBDY) / 4;
      const ladderLBDX = blockLBDX + (blockLFDX - blockLBDX) / 4;
      const ladderLBDY = blockLBDY + (blockLFDY - blockLBDY) / 4;
      const ladderLFUX = ladderLFDX;
      const ladderLFUY = ladderLFDY - size;
      const ladderLBUX = ladderLBDX;
      const ladderLBUY = ladderLBDY - size;
  
      drawLine(ladderLFDX, ladderLFDY, ladderLFUX, ladderLFUY, app.color.sWordsC, 4);
      drawLine(ladderLBDX, ladderLBDY, ladderLBUX, ladderLBUY, app.color.sWordsC, 4);
  
      for (let i = 1; i < 5; i++) {
        drawLine(
          ladderLFDX, ladderLFDY - i * 0.25 * size,
          ladderLBDX, ladderLBDY - i * 0.25 * size,
          app.color.sWordsC, 3
        );
      }
    } else if (direction === 'R') {
      const [blockRFDX, blockRFDY] = getBlockLFD(app, x + 1, y, z);
      const [blockRFUX, blockRFUY] = getBlockLFD(app, x + 1, y, z + 1);
      const [blockLFDX, blockLFDY] = getBlockLFD(app, x, y, z);
      const [blockLFUX, blockLFUY] = getBlockLFD(app, x, y, z + 1);
  
      const ladderRFDX = blockLFDX + (blockRFDX - blockLFDX) / 4;
      const ladderRFDY = blockLFDY - (blockLFDY - blockRFDY) / 4;
      const ladderRBDX = blockRFDX - (blockRFDX - blockLFDX) / 4;
      const ladderRBDY = blockRFDY + (blockLFDY - blockRFDY) / 4;
      const ladderRFUX = ladderRFDX;
      const ladderRFUY = ladderRFDY - size;
      const ladderRBUX = ladderRBDX;
      const ladderRBUY = ladderRBDY - size;
  
      drawLine(ladderRFDX, ladderRFDY, ladderRFUX, ladderRFUY, app.color.sWordsC, 4);
      drawLine(ladderRBDX, ladderRBDY, ladderRBUX, ladderRBUY, app.color.sWordsC, 4);
  
      for (let i = 1; i < 5; i++) {
        drawLine(
          ladderRFDX, ladderRFDY - i * 0.25 * size,
          ladderRBDX, ladderRBDY - i * 0.25 * size,
          app.color.sWordsC, 3
        );
      }
    }
  }  


  function drawSunnyModeInstructions(app, ctx) {
    const theme = app.color;
  
    drawLabel("Goal:", 610, 50, {
      fill: theme.sLineC,
      size: 25,
      align: 'left',
      bold: true,
      opacity: 0.9,
      font: 'Kefa'
    });
  
    drawLabel("It is a sunny day today,", 630, 85, {
      fill: theme.sLineC,
      size: 22,
      align: 'left',
      bold: true,
      opacity: 0.8,
      font: 'Kefa'
    });
  
    drawLabel("Collect ALL SUNS around", 657, 115, {
      fill: theme.sLineC,
      size: 22,
      align: 'left',
      bold: true,
      opacity: 0.8,
      font: 'Kefa'
    });
  
    drawLabel("Go from TOP LEFT Corner", 684, 140, {
      fill: theme.sLineC,
      size: 22,
      align: 'left',
      bold: true,
      opacity: 1.0,
      font: 'Kefa'
    });
  
    drawLabel("to DOWN RIGHT Corner", 711, 175, {
      fill: theme.sLineC,
      size: 22,
      align: 'left',
      bold: true,
      opacity: 1.0,
      font: 'Kefa'
    });
  
    drawInstructionBlock(app, 900, 350, 45);
  }

  
  function drawInstructionBlock(app, x, y, size) {
    const { sLineC, sCubeLC, sCubeFC, sCubeTC, sWordsC } = app.color;
    const cos45 = Math.cos(Math.PI / 4);
    const cos18 = Math.cos(Math.PI / 10);
    const sin18 = Math.sin(Math.PI / 10);
  
    const x1 = x - size * cos45;
    const y1 = y - size * cos45 - size;
    const x2 = x + size * cos18 - size * cos45;
    const y2 = y - size * sin18 - size - size * cos45;
    const x3 = x + size * cos18;
    const y3 = y - size * sin18 - size;

    drawLadderLines(x1, y1, x2, y2, size, sWordsC);

    drawLadderLines(x2, y2, x3, y3, size, sWordsC);
  
    // Outlines
    drawLine(x2, y2, x2, y2 + size, sLineC, 3);
    drawLine(x2, y2 + size, x - size * cos45, y - size * cos45, sLineC, 3);
    drawLine(x2, y2 + size, x3, y3 + size, sLineC, 3);
  
    // Cube Faces
    drawPolygon(
      x, y,
      x, y - size,
      x - size * cos45, y - size * cos45 - size,
      x - size * cos45, y - size * cos45,
      { fill: sCubeLC, stroke: sLineC, strokeWidth: 2, opacity: 0.6 }
    );
  
    drawPolygon(
      x, y,
      x, y - size,
      x + size * cos18, y - size * sin18 - size,
      x + size * cos18, y - size * sin18,
      { fill: sCubeFC, stroke: sLineC, strokeWidth: 2, opacity: 0.6 }
    );
  
    drawPolygon(
      x, y - size,
      x + size * cos18, y - size * sin18 - size,
      x + size * cos18 - size * cos45, y - size * sin18 - size - size * cos45,
      x - size * cos45, y - size * cos45 - size,
      { fill: sCubeTC, stroke: sLineC, strokeWidth: 2, opacity: 0.6 }
    );
  
    // North Ladder
    if (app.northLadder) {
      drawLadderLines(x1, y1, x2, y2, size, sWordsC);
    }
  
    // East Ladder
    if (app.eastLadder) {
      drawLadderLines(x2, y2, x3, y3, size, sWordsC);
    }
  }
  


  function drawLadderLines(x1, y1, x2, y2, size, color) {
    const leftX = x1 + (x2 - x1) / 4;
    const rightX = x1 + (x2 - x1) * 3 / 4;
    const topY = y2 + (y1 - y2) * 3 / 4;
    const bottomY = topY + size;
  
    drawLine(leftX, topY, leftX, bottomY, color, 3);
    drawLine(rightX, y2 + (y1 - y2) / 4, rightX, y2 + (y1 - y2) / 4 + size, color, 3);
  
    for (let i = 1; i <= 3; i++) {
      const offset = size / 4 * i;
      drawLine(
        leftX, topY + offset,
        rightX, y2 + (y1 - y2) / 4 + offset,
        color, 2
      );
    }
  }

  function drawMiniMap(app, ctx) {
    const originX = 800;
    const originY = 450;
    const size = 90;
  
    drawLabel('Mini Map', originX + 45, originY - 20, {
      fill: app.color.sWordsC,
      bold: true,
      size: 23,
      opacity: 0.8,
      font: 'Kefa'
    }, ctx);
  
    drawRect(originX, originY, size, size, {
      border: app.color.sLineC,
      fill: app.color.sCubeFC,
      borderWidth: 3,
      opacity: 0.8
    }, ctx);
  
    if (app.mode === 'sunny') {
      drawCoins(app, ctx, originX, originY, size);
    }
  
    const cell = size / app.dimension;
  
    drawRect(originX, originY, cell, cell, {
      fill: app.color.sCubeTC,
      border: app.color.sWordsC
    }, ctx);
  
    drawRect(originX + size - cell, originY + size - cell, cell, cell, {
      fill: app.color.sCubeTC,
      border: app.color.sWordsC
    }, ctx);
  
    const [x, y] = get2dCoordinate(app, originX, originY, size);
    drawCircle(x-6, y+6, 10, {fill: app.color.sWordsC});
    drawCircle(x-6, y+6, 6, {fill: app.color.sLineC});
    drawCircle(x-6, y+6, 3, {fill: app.color.sWordsC});
  }
  
  function drawCoins(app, ctx, originX, originY, size) {
    const cell = size / app.dimension;
  
    for (const [a, b] of app.coins) {
      drawLabel('R', originX + cell * (a + 0.5), originY + size - cell * (b + 0.2), {
        fill: app.color.sWordsC,
        font: 'Wingdings',
        size: 20,
        bold: true
      }, ctx);
    }
  
    for (let i = 0; i < app.coins.length; i++) {
      drawLabel('R', originX + size - i * 25, originY + size + 25, {
        fill: app.color.sCubeFC,
        font: 'Wingdings',
        size: 30,
        bold: true,
        opacity: 0.5
      }, ctx);
    }
  
    for (const [a, b] of app.gotCoins) {
      drawLabel('R', originX + cell * (a + 0.5), originY + size - cell * (b + 0.2), {
        fill: app.color.sCubeFC,
        font: 'Wingdings',
        size: 20,
        bold: true
      }, ctx);
    }
  
    for (let i = 0; i < app.gotCoins.length; i++) {
      drawLabel('R', originX + size - i * 25, originY + size + 25, {
        fill: app.color.sWordsC,
        font: 'Wingdings',
        size: 30,
        bold: true
      }, ctx);
    }
  }
  
  function get2dCoordinate(app, originX, originY, size) {
    const cell = size / app.dimension;
    const x = originX + cell * (app.char.x + 0.5);
    const y = originY + size - cell * (app.char.y + 0.5);
    return [x, y];
  }
  
  function drawKeyInstruction(app, ctx) {
    // drawLabel('arrow_upward', 240, 580, {
    //   fill: app.color.sLineC,
    //   size: 40,
    //   font: 'Material Symbols Outlined',
    // }, ctx);
  
    // drawLabel('↑ ↓ → ←', 270, 620, {
    //   fill: app.color.sWordsC,
    //   size: 20,
    //   font: 'Kefa',
    //   bold: true,
    //   rotateAngle: -25
    // }, ctx);
  
    // drawLabel('arrow_downward', 183, 520, {
    //   fill: app.color.sLineC,
    //   size: 40,
    //   font: 'Material Symbols Outlined',
    //   rotateAngle: -135
    // }, ctx);
  
    // drawLabel('keyboard_arrow_right', 300, 540, {
    //   fill: app.color.sLineC,
    //   size: 40,
    //   font: 'Material Symbols Outlined',
    //   rotateAngle: -25
    // }, ctx);
  
    // drawLabel('keyboard_arrow_left', 160, 600, {
    //   fill: app.color.sLineC,
    //   size: 40,
    //   font: 'Material Symbols Outlined',
    //   rotateAngle: 155
    // }, ctx);
  
    drawLabel('arrow_upward', 60, 370, {
      fill: app.color.sLineC,
      size: 40,
      font: 'Material Symbols Outlined'
    }, ctx);
  
    drawLabel('SPACE + UP', 100, 360, {
      fill: app.color.sWordsC,
      size: 20,
      font: 'Kefa',
      bold: true,
      align: 'left'
    }, ctx);
  
    drawLabel('arrow_downward', 60, 440, {
      fill: app.color.sLineC,
      size: 40,
      font: 'Material Symbols Outlined',
      rotateAngle: 180
    }, ctx);
  
    drawLabel('SPACE + DOWN', 100, 430, {
      fill: app.color.sWordsC,
      size: 20,
      font: 'Kefa',
      bold: true,
      align: 'left'
    }, ctx);
  }
  
  
  
  
  


// function drawBackground(app, ctx) {
// }

export { drawBlock, drawStarterBlockTop, drawLadder, getBlockLFD, drawSunnyModeInstructions, drawMiniMap, drawKeyInstruction};
