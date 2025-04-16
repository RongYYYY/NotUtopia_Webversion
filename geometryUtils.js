// geometryUtils.js

function getBlockLFD(app, xCoo, yCoo, zCoo) {
    const degToRad = (deg) => deg * Math.PI / 180;
    const isoAngle1 = degToRad(18);
    const isoAngle2 = degToRad(45);
  
    const xOffset = xCoo * (app.blockSize * Math.cos(isoAngle1));
    const yOffset = yCoo * (app.blockSize * Math.cos(isoAngle2));
    const zOffset = zCoo * app.blockSize;
    const verticalOffset = yCoo * (app.blockSize * Math.sin(isoAngle2)) * 0.9;
    const xZOffset = xCoo * (app.blockSize * Math.sin(isoAngle1));
  
    const blockLFDX = Math.floor(app.mazeLFDX + xOffset - yOffset);
    const blockLFDY = Math.floor(app.mazeLFDY - verticalOffset - zOffset - xZOffset);
  
    return [blockLFDX, blockLFDY];
  }
  
  export { getBlockLFD };