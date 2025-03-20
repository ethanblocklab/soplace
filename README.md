# So Place - 2.5D Grid-Based Placement Game

A 2.5D isometric grid-based placement game built with Next.js and Phaser where players can drag and drop buildings and objects onto a map.

## Features

- Isometric 2.5D grid for realistic depth perception
- Drag and drop functionality for placing objects
- Validation for object placement (preventing overlaps)
- Object rotation
- Simple UI for selecting different building types
- Ability to save the current map layout

## Technologies Used

- Next.js (App Router)
- TypeScript
- Phaser 3 for game development
- Tailwind CSS for styling
- SVG assets for graphics

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/soplace.git
   cd soplace
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. Select a building or object from the palette at the bottom of the screen
2. Click the "Place Selected Object" button to add it to the map
3. Drag objects to reposition them on the grid
4. Use the "Save Map" button to export your current layout (currently saves to console)

## Project Structure

- `/app` - Next.js application code
  - `/components` - React components including the game container
  - `/game` - Phaser game logic
    - `MainScene.ts` - Main Phaser scene for the game
    - `types.ts` - TypeScript interfaces and types
- `/public/assets/game` - Game assets (SVG graphics)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by city-builder and tycoon games
- SVG assets created for this project
