import Phaser from 'phaser'
import {
  GameConfig,
  GameMap,
  GameObjectData,
  PlacedObject,
  GridPosition,
} from './types'

export class MainScene extends Phaser.Scene {
  private map: GameMap
  private config: GameConfig
  private placedObjects: Map<string, Phaser.GameObjects.Sprite> = new Map()
  private dragObject: Phaser.GameObjects.Sprite | null = null
  private isDragging: boolean = false
  private objectsLayer!: Phaser.GameObjects.Container
  private ghostObject: Phaser.GameObjects.Sprite | null = null
  private validPlacement: boolean = false

  constructor(map: GameMap, config: GameConfig) {
    super({ key: 'MainScene' })
    this.map = map
    this.config = config
  }

  preload(): void {
    // Load grid tile
    this.load.image('grid-tile', `${this.config.assetPath}/grid-tile.svg`)

    // Load all game object sprites
    const uniqueObjects = new Set<string>()
    this.map.objects.forEach((obj) => {
      if (!uniqueObjects.has(obj.objectData.sprite)) {
        uniqueObjects.add(obj.objectData.sprite)
        this.load.image(
          obj.objectData.sprite,
          `${this.config.assetPath}/${obj.objectData.sprite}.svg`,
        )
      }
    })

    // Load sample objects
    this.load.image('house1', `${this.config.assetPath}/house1.svg`)
    this.load.image('house2', `${this.config.assetPath}/house2.svg`)
    this.load.image('shop', `${this.config.assetPath}/shop.svg`)
    this.load.image('tree', `${this.config.assetPath}/tree.svg`)
  }

  create(): void {
    // Create isometric grid
    this.createGrid()

    // Create container for objects
    this.objectsLayer = this.add.container(0, 0)

    // Add all placed objects to the scene
    this.map.objects.forEach((obj) => this.addPlacedObject(obj))

    // Set up input handling
    this.input.on('pointerdown', this.onPointerDown, this)
    this.input.on('pointermove', this.onPointerMove, this)
    this.input.on('pointerup', this.onPointerUp, this)
  }

  private createGrid(): void {
    // Create grid with isometric tiles
    const tileSize = this.config.tileSize
    const gridWidth = this.config.gridWidth
    const gridHeight = this.config.gridHeight

    // Create the grid visual representation
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const isoX = ((x - y) * tileSize) / 2
        const isoY = ((x + y) * tileSize) / 4

        const tile = this.add.image(
          isoX + this.cameras.main.width / 2,
          isoY + 100,
          'grid-tile',
        )

        tile.setInteractive()
        tile.setData('gridX', x)
        tile.setData('gridY', y)
      }
    }
  }

  private addPlacedObject(obj: PlacedObject): void {
    const tileSize = this.config.tileSize

    // Calculate isometric position
    const isoX = ((obj.position.x - obj.position.y) * tileSize) / 2
    const isoY = ((obj.position.x + obj.position.y) * tileSize) / 4

    const sprite = this.add.sprite(
      isoX + this.cameras.main.width / 2,
      isoY + 100 - (obj.objectData.height * tileSize) / 4, // Adjust height for perspective
      obj.objectData.sprite,
    )

    sprite.setData('objectId', obj.id)
    sprite.setData('objectData', obj.objectData)
    sprite.setData('position', obj.position)
    sprite.setData('rotation', obj.rotation)

    // Apply rotation
    sprite.setAngle(obj.rotation)

    // Add to our placed objects map
    this.placedObjects.set(obj.id, sprite)
    this.objectsLayer.add(sprite)
  }

  private gridPositionToScreen(pos: GridPosition): { x: number; y: number } {
    const tileSize = this.config.tileSize
    const isoX = ((pos.x - pos.y) * tileSize) / 2
    const isoY = ((pos.x + pos.y) * tileSize) / 4

    return {
      x: isoX + this.cameras.main.width / 2,
      y: isoY + 100,
    }
  }

  private screenToGridPosition(screenX: number, screenY: number): GridPosition {
    const tileSize = this.config.tileSize
    const offsetX = screenX - this.cameras.main.width / 2
    const offsetY = screenY - 100

    // Inverse isometric transformation
    // These formulas convert from screen coordinates back to grid coordinates
    const gridX = Math.floor(
      (offsetX / (tileSize / 2) + offsetY / (tileSize / 4)) / 2,
    )
    const gridY = Math.floor(
      (-offsetX / (tileSize / 2) + offsetY / (tileSize / 4)) / 2,
    )

    return { x: gridX, y: gridY }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // Check if we clicked on a placed object
    const worldPoint = pointer.positionToCamera(
      this.cameras.main,
    ) as Phaser.Math.Vector2

    // Find the object under the pointer
    const clicked = this.objectsLayer.getAll().find((obj) => {
      if (obj instanceof Phaser.GameObjects.Sprite) {
        const bounds = obj.getBounds()
        return bounds.contains(worldPoint.x, worldPoint.y)
      }
      return false
    }) as Phaser.GameObjects.Sprite

    if (clicked) {
      this.isDragging = true
      this.dragObject = clicked

      // Create ghost object for placement preview
      const objectData = clicked.getData('objectData') as GameObjectData

      this.ghostObject = this.add.sprite(
        clicked.x,
        clicked.y,
        objectData.sprite,
      )

      this.ghostObject.setAlpha(0.5)

      // Remove the original object from the map
      if (this.dragObject) {
        const objectId = this.dragObject.getData('objectId') as string
        this.map.objects = this.map.objects.filter((obj) => obj.id !== objectId)
      }
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || !this.dragObject || !this.ghostObject) {
      return
    }

    // Get the grid position from the current mouse position
    const gridPos = this.screenToGridPosition(pointer.x, pointer.y)

    // Calculate screen position for the ghost object
    const screenPos = this.gridPositionToScreen(gridPos)

    // Get the object data
    const objectData = this.dragObject.getData('objectData') as GameObjectData

    // Position the ghost with height offset based on object height
    this.ghostObject.setPosition(
      screenPos.x,
      screenPos.y - (objectData.height * this.config.tileSize) / 4,
    )

    // Check if the placement is valid
    this.validPlacement = this.checkValidPlacement(gridPos, objectData)
    this.ghostObject.setTint(this.validPlacement ? 0xffffff : 0xff0000)
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || !this.dragObject || !this.ghostObject) {
      return
    }

    const gridPos = this.screenToGridPosition(pointer.x, pointer.y)
    const objectData = this.dragObject.getData('objectData') as GameObjectData
    const objectId = this.dragObject.getData('objectId') as string
    const rotation = this.dragObject.getData('rotation') as number

    if (this.validPlacement) {
      // Add the object to the new position
      const newObject: PlacedObject = {
        id: objectId,
        objectData,
        position: gridPos,
        rotation,
      }

      this.map.objects.push(newObject)

      // Update the visual representation
      this.placedObjects.delete(objectId)
      this.addPlacedObject(newObject)
    } else {
      // Return the object to its original position
      const originalPosition = this.dragObject.getData(
        'position',
      ) as GridPosition

      const newObject: PlacedObject = {
        id: objectId,
        objectData,
        position: originalPosition,
        rotation,
      }

      this.map.objects.push(newObject)
      this.addPlacedObject(newObject)
    }

    // Clean up
    if (this.ghostObject) {
      this.ghostObject.destroy()
      this.ghostObject = null
    }

    this.isDragging = false
    this.dragObject = null
  }

  private checkValidPlacement(
    position: GridPosition,
    objectData: GameObjectData,
  ): boolean {
    // Check if position is within grid bounds
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x + objectData.width > this.config.gridWidth ||
      position.y + objectData.height > this.config.gridHeight
    ) {
      return false
    }

    // Check if the area is free from other objects
    for (const obj of this.map.objects) {
      // Check for overlap with other objects
      if (
        position.x < obj.position.x + obj.objectData.width &&
        position.x + objectData.width > obj.position.x &&
        position.y < obj.position.y + obj.objectData.height &&
        position.y + objectData.height > obj.position.y
      ) {
        return false
      }
    }

    return true
  }

  // Method to be called from outside to add a new object
  public addNewObject(
    objectData: GameObjectData,
    position: GridPosition,
  ): string {
    const id = `obj_${Date.now()}`

    const newObject: PlacedObject = {
      id,
      objectData,
      position,
      rotation: 0,
    }

    if (this.checkValidPlacement(position, objectData)) {
      this.map.objects.push(newObject)
      this.addPlacedObject(newObject)
      return id
    }

    return ''
  }

  // Method to rotate the selected object
  public rotateObject(id: string): void {
    const obj = this.map.objects.find((o) => o.id === id)
    if (obj) {
      obj.rotation = (obj.rotation + 90) % 360

      // Update visual representation
      const sprite = this.placedObjects.get(id)
      if (sprite) {
        sprite.setAngle(obj.rotation)
      }
    }
  }

  // Get the current game map
  public getMap(): GameMap {
    return this.map
  }
}
