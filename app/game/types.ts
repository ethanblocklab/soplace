export interface GridPosition {
  x: number
  y: number
}

export interface GameObjectData {
  id: string
  type: string
  name: string
  sprite: string // path to the sprite image
  width: number // width in grid cells
  height: number // height in grid cells
  isometric?: boolean // whether the object is rendered isometrically
}

export interface PlacedObject {
  id: string
  objectData: GameObjectData
  position: GridPosition
  rotation: number // 0, 90, 180, 270 degrees
}

export interface GameMap {
  width: number
  height: number
  objects: PlacedObject[]
}

export interface GameConfig {
  tileSize: number
  gridWidth: number
  gridHeight: number
  assetPath: string
}
