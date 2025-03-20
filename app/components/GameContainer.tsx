'use client'

import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { MainScene } from '../game/MainScene'
import { GameConfig, GameMap, GameObjectData } from '../game/types'

// Default game configuration
const defaultConfig: GameConfig = {
  tileSize: 64,
  gridWidth: 10,
  gridHeight: 10,
  assetPath: '/assets/game',
}

// Initial empty map
const initialMap: GameMap = {
  width: 10,
  height: 10,
  objects: [],
}

// Sample building objects
const sampleObjects: GameObjectData[] = [
  {
    id: 'house1',
    type: 'residential',
    name: 'Small House',
    sprite: 'house1',
    width: 1,
    height: 1,
    isometric: true,
  },
  {
    id: 'house2',
    type: 'residential',
    name: 'Medium House',
    sprite: 'house2',
    width: 2,
    height: 1,
    isometric: true,
  },
  {
    id: 'shop1',
    type: 'commercial',
    name: 'Shop',
    sprite: 'shop',
    width: 1,
    height: 1,
    isometric: true,
  },
  {
    id: 'tree1',
    type: 'decoration',
    name: 'Tree',
    sprite: 'tree',
    width: 1,
    height: 1,
    isometric: true,
  },
]

interface GameContainerProps {
  width?: number
  height?: number
}

const GameContainer: React.FC<GameContainerProps> = ({
  width = 800,
  height = 600,
}) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const mainSceneRef = useRef<MainScene | null>(null)
  const [selectedObject, setSelectedObject] =
    React.useState<GameObjectData | null>(null)

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    // Initialize Phaser game
    const mainScene = new MainScene(initialMap, defaultConfig)
    mainSceneRef.current = mainScene

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: gameRef.current,
      backgroundColor: '#f0f0f0',
      scene: [mainScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    }

    phaserGameRef.current = new Phaser.Game(config)

    // Clean up on component unmount
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [width, height])

  const handleObjectSelect = (objectData: GameObjectData) => {
    setSelectedObject(objectData)
  }

  const handlePlaceObject = () => {
    if (!selectedObject || !mainSceneRef.current) return

    // Place in the center of the grid for simplicity
    // In a real app, you might want to get the exact grid position from mouse coordinates
    const centerPosition = {
      x: Math.floor(defaultConfig.gridWidth / 2),
      y: Math.floor(defaultConfig.gridHeight / 2),
    }

    mainSceneRef.current.addNewObject(selectedObject, centerPosition)
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 border border-gray-300 rounded-lg overflow-hidden"
        ref={gameRef}
      />

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Building Palette</h3>
        <div className="grid grid-cols-4 gap-4">
          {sampleObjects.map((obj) => (
            <div
              key={obj.id}
              className={`p-2 border rounded-md cursor-pointer ${
                selectedObject?.id === obj.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
              onClick={() => handleObjectSelect(obj)}
            >
              <div className="text-center text-sm">{obj.name}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
            onClick={handlePlaceObject}
            disabled={!selectedObject}
          >
            Place Selected Object
          </button>

          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
            onClick={() => {
              const map = mainSceneRef.current?.getMap()
              if (map) {
                console.log('Current map state:', map)
                alert('Map saved to console')
              }
            }}
          >
            Save Map
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameContainer
