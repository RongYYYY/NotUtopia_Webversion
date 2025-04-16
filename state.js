// state.js
import { colorThemes } from './colorThemes.js'; // Assuming colorThemes is defined elsewhere

export const state = {
  currentScreen: "start", // "start" or "game"
  selectedMode: null,     // "sunny" or "foggy"
  selectedDimension: null, // 6, 8, or 10
  colorTheme: 1,          // 1 = Schenley, 2 = Allegheny, 3 = Squirrel Hill
  selectedColor: null,    // If using manual override (optional)
  colorThemes,            // Theme definitions
  app: null,              // Game instance object
  win: false              // Game win status
};
