import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import {
    getAllItemTileFrames,
    getUserIndexToTileFrame,
} from "../utils/ItemTileMapper";

interface PlacedItem {
    id: string;
    itemId: number;
    player: string;
    x: number;
    y: number;
}

export class Game extends Scene {
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private draggedTile: Phaser.GameObjects.Sprite | null = null;
    private previewSprite: Phaser.GameObjects.Sprite | null = null;
    private itemTiles: Phaser.GameObjects.Sprite[] = [];
    private map: Phaser.Tilemaps.Tilemap;
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private cameraStartX: number = 0;
    private cameraStartY: number = 0;
    private placedItems: PlacedItem[] = [];
    private selectedFrameIndex: number | null = null;

    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets");

        // Setup loading events
        this.load.on("progress", (value: number) => {
            EventBus.emit("loading-progress", value);
        });

        this.load.on("complete", () => {
            EventBus.emit("loading-progress", 1);
        });

        this.load.tilemapTiledJSON("map", "tiles/map2.json");
        this.load.spritesheet("tiles", "tiles/outside.png", {
            frameWidth: 64,
        });

        // Load decorations spritesheet
        this.load.spritesheet("decorations", "tiles/decor.png", {
            frameWidth: 315,
            frameHeight: 420,
        });
        this.load.spritesheet("items", "tiles/items.png", {
            frameWidth: 512,
            frameHeight: 512,
        });

        this.load.image("background", "tiles/sky_gradient.png");
    }

    create() {
        const forestBackground = this.add
            .rectangle(
                0,
                0,
                this.cameras.main.width * 2,
                this.cameras.main.height * 2,
                0x0a3410
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(-2);

        // Create the map
        this.map = this.add.tilemap("map");

        // Add the tilesets
        const tileset = this.map.addTilesetImage("outside", "tiles");
        if (!tileset) throw new Error("Failed to load tileset");

        // Create the layers
        const layer = this.map.createLayer("Tile Layer 1", tileset);
        if (!layer) throw new Error("Failed to create ground layer");
        this.groundLayer = layer;

        // Set camera bounds with layer offset
        const mapWidth = this.map.widthInPixels;
        const mapHeight = this.map.heightInPixels;

        this.cameras.main.setBounds(-mapWidth / 2, 0, mapWidth, mapHeight);

        // Add decorations to fill the empty corners
        this.fillEmptyCorners();

        // Add mouse drag functionality
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 0) {
                // Left click
                // Only enable map dragging if we're not dragging an item
                if (!this.draggedTile) {
                    this.isDragging = true;
                    this.dragStartX = pointer.x;
                    this.dragStartY = pointer.y;
                    this.cameraStartX = this.cameras.main.scrollX;
                    this.cameraStartY = this.cameras.main.scrollY;
                }
            }
        });

        this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 0) {
                // Left click
                this.isDragging = false;
            }
        });

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging && !this.draggedTile) {
                const dx = this.dragStartX - pointer.x;
                const dy = this.dragStartY - pointer.y;

                this.cameras.main.scrollX = this.cameraStartX + dx;
                this.cameras.main.scrollY = this.cameraStartY + dy;
            }
        });

        // Listen for item selections from the React component
        EventBus.on("item-selected", (frameIndex: number) => {
            this.handleItemSelected(frameIndex);
        });

        const cursors = this.input.keyboard!.createCursorKeys();

        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.04,
            drag: 0.0005,
            maxSpeed: 0.7,
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
            controlConfig
        );

        this.input.on("dragstart", this.onDragStart, this);
        this.input.on("drag", this.onDrag, this);
        this.input.on("dragend", this.onDragEnd, this);

        // Listen for placed items from external sources
        EventBus.on("items-loaded", (items: PlacedItem[]) =>
            this.initPlacedItems(items)
        );

        EventBus.emit("current-scene-ready", this);
    }

    onDragStart(
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite
    ) {
        this.draggedTile = gameObject;
        gameObject.setTint(0x66ff66);

        // Create preview sprite
        this.previewSprite = this.add.sprite(
            0,
            0,
            "items",
            gameObject.getData("frameIndex")
        );
        // Scale down the preview sprite to fit tile size
        this.previewSprite.setScale(64 / 512);
        this.previewSprite.setAlpha(0.5);
        this.previewSprite.setTint(0x00ff00);
    }

    onDrag(
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite,
        dragX: number,
        dragY: number
    ) {
        gameObject.x = dragX;
        gameObject.y = dragY;

        // Update preview sprite position
        if (this.previewSprite) {
            const worldPoint = this.cameras.main.getWorldPoint(
                pointer.x,
                pointer.y
            );
            const pointerXY = this.map.worldToTileXY(
                worldPoint.x,
                worldPoint.y,
                true
            );

            if (pointerXY) {
                const tileX = pointerXY.x;
                const tileY = pointerXY.y;

                if (this.canPlaceItem(tileX, tileY)) {
                    this.previewSprite.setAlpha(0.5);
                    this.previewSprite.setTint(0x00ff00);
                } else {
                    this.previewSprite.setAlpha(0.3);
                    this.previewSprite.setTint(0xff0000);
                }

                const worldXY = this.map.tileToWorldXY(tileX, tileY);
                if (worldXY) {
                    this.previewSprite.setPosition(
                        worldXY.x + 32,
                        worldXY.y + 32
                    );
                }
            }
        }
    }

    onDragEnd(
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite
    ) {
        gameObject.clearTint();

        // Remove preview sprite
        if (this.previewSprite) {
            this.previewSprite.destroy();
            this.previewSprite = null;
        }

        const worldPoint = this.cameras.main.getWorldPoint(
            pointer.x,
            pointer.y
        );

        const pointerXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        if (!pointerXY) return;

        const tileX = Math.floor(pointerXY.x);
        const tileY = Math.floor(pointerXY.y);

        if (this.canPlaceItem(tileX, tileY)) {
            const frameIndex = gameObject.getData("frameIndex");
            this.placeItem(tileX, tileY, frameIndex);
        }

        const dragStartX = gameObject.input?.dragStartX ?? gameObject.x;
        const dragStartY = gameObject.input?.dragStartY ?? gameObject.y;
        gameObject.setPosition(dragStartX, dragStartY);

        // Remove the dragged tile
        if (this.draggedTile) {
            this.draggedTile = null;
        }
    }

    canPlaceItem(tileX: number, tileY: number): boolean {
        // Check if any sprite already exists at this tile position
        const existingItem = this.itemTiles.find(
            (sprite) =>
                sprite.getData("tileX") === tileX &&
                sprite.getData("tileY") === tileY
        );

        if (existingItem) {
            return false;
        }

        // Ensure the ground tile exists (we can only place on valid ground)
        const groundTile = this.groundLayer.getTileAt(tileX, tileY, true);
        return groundTile !== null && groundTile.index !== -1;
    }

    placeItem(tileX: number, tileY: number, frameIndex: number) {
        // Send the placement event to the blockchain
        EventBus.emit("place-item", tileX, tileY, frameIndex);

        // Add event listener for when the item is placed on-chain
        const handleItemPlaced = (success: boolean, error?: Error) => {
            // Remove the listener to avoid memory leaks
            EventBus.removeListener("item-placed", handleItemPlaced);

            if (success) {
                // Convert tile coordinates to world coordinates
                const worldXY = this.map.tileToWorldXY(tileX, tileY);
                if (worldXY) {
                    // Create a sprite instead of placing a tile
                    const sprite = this.add.sprite(
                        worldXY.x + 32, // Center in the tile (64/2)
                        worldXY.y + 32,
                        "items",
                        frameIndex
                    );

                    // Scale down the sprite to fit tile size (512px -> 64px)
                    sprite.setScale(64 / 512);

                    // Store the sprite for later management
                    this.itemTiles.push(sprite);

                    // Store data in the sprite for identification
                    sprite.setData("tileX", tileX);
                    sprite.setData("tileY", tileY);
                    sprite.setData("frameIndex", frameIndex);
                }

                console.log(
                    `Item placed at (${tileX}, ${tileY}) with type ${frameIndex}`
                );
            }
        };

        // Add the listener
        EventBus.on("item-placed", handleItemPlaced);
    }

    update(time: number, delta: number) {
        this.controls.update(delta);

        // Update preview sprite position if it exists
        if (this.previewSprite && this.selectedFrameIndex !== null) {
            const pointer = this.input.activePointer;
            const worldPoint = this.cameras.main.getWorldPoint(
                pointer.x,
                pointer.y
            );
            const pointerXY = this.map.worldToTileXY(
                worldPoint.x,
                worldPoint.y
            );

            if (pointerXY) {
                const tileX = pointerXY.x;
                const tileY = pointerXY.y;

                // Make preview visible when over the map
                this.previewSprite.visible = true;

                if (this.canPlaceItem(tileX, tileY)) {
                    this.previewSprite.setAlpha(0.5);
                    this.previewSprite.setTint(0x00ff00);
                } else {
                    this.previewSprite.setAlpha(0.3);
                    this.previewSprite.setTint(0xff0000);
                }

                const worldXY = this.map.tileToWorldXY(tileX, tileY);
                if (worldXY) {
                    this.previewSprite.setPosition(
                        worldXY.x + 32,
                        worldXY.y + 32
                    );
                }
            } else {
                // Hide preview when outside the map area
                this.previewSprite.visible = false;
            }
        }
    }

    // Initialize placed items from GraphQL data
    initPlacedItems(items: PlacedItem[]) {
        this.placedItems = items;

        // Clean up existing item sprites
        this.itemTiles.forEach((sprite) => sprite.destroy());
        this.itemTiles = [];

        // Place each item on the map as a sprite
        for (const item of this.placedItems) {
            const { x, y, itemId } = item;

            // Convert tile coordinates to world coordinates
            const worldXY = this.map.tileToWorldXY(x, y);
            if (worldXY) {
                // Create a sprite for the item
                const sprite = this.add.sprite(
                    worldXY.x + 32, // Center in the tile
                    worldXY.y + 32,
                    "items",
                    itemId
                );

                // Scale down the sprite to fit tile size
                sprite.setScale(64 / 512);

                // Store the sprite for later management
                this.itemTiles.push(sprite);

                // Store data in the sprite for identification
                sprite.setData("tileX", x);
                sprite.setData("tileY", y);
                sprite.setData("frameIndex", itemId);
            }
        }
    }

    // Fill the empty corners of the diamond-shaped map
    fillEmptyCorners() {
        const mapWidth = this.map.widthInPixels;
        const mapHeight = this.map.heightInPixels;

        // Ensure coverage area is large enough
        const fillMargin = Math.max(mapWidth, mapHeight) * 0.8;

        // Calculate fill area (larger than the map)
        const fillArea = {
            top: 0,
            left: -mapWidth / 2,
            right: mapWidth / 2,
            bottom: mapHeight,
        };

        // Get map center point
        const mapCenterX = 0; // Map center x-coordinate is 0 due to camera settings
        const mapCenterY = mapHeight / 2;

        // Function to check if a point is inside the diamond-shaped map
        const isPointInMap = (x: number, y: number) => {
            // Calculate relative distance to center
            const relX = Math.abs(x - mapCenterX);
            const relY = Math.abs(y - mapCenterY);

            // Calculate normalized distance relative to diamond boundary
            const normalizedDist =
                relX / (mapWidth / 2) + relY / (mapHeight / 2);

            // Point is inside the diamond if normalized distance < 0.98
            return normalizedDist < 0.98;
        };

        // Decoration density and spacing
        const density = 1;
        const spacing = 30; // Reduced spacing for denser decorations

        // Place decorations over the entire extended area
        for (let x = fillArea.left; x < fillArea.right; x += spacing) {
            for (let y = fillArea.top; y < fillArea.bottom; y += spacing) {
                // Add random offset
                const worldX = x + Math.random() * spacing * 0.6;
                const worldY = y + Math.random() * spacing * 0.6;

                // Only place decorations OUTSIDE the map area
                if (!isPointInMap(worldX, worldY) && Math.random() < density) {
                    let preferredItems: number[];

                    // Choose appropriate decorations based on position
                    if (worldY < mapCenterY) {
                        // Upper areas prefer trees
                        preferredItems = [0, 1, 2, 3]; // Pine trees and deciduous trees
                    } else {
                        // Lower areas prefer bushes and rocks
                        preferredItems = [0, 1]; // Bushes and rocks
                    }

                    // Place decoration
                    this.placeDecorationInWorld(worldX, worldY, preferredItems);
                }
            }
        }
    }

    placeDecorationInWorld(
        worldX: number,
        worldY: number,
        preferredItems?: number[]
    ) {
        // Select decoration type based on preferences
        let frameIndex: number;

        if (preferredItems && preferredItems.length > 0) {
            if (Math.random() < 0.8) {
                // 80% chance to use preferred decoration types
                frameIndex =
                    preferredItems[
                        Math.floor(Math.random() * preferredItems.length)
                    ];
            } else {
                // 20% chance to randomly select any decoration
                frameIndex = Math.floor(Math.random() * 4);
            }
        } else {
            // If no preference specified, choose randomly
            frameIndex = Math.floor(Math.random() * 4);
        }

        // Create decoration sprite
        const decoration = this.add
            .sprite(worldX, worldY, "decorations", frameIndex)
            .setDepth(1); // Set depth to ensure visibility above background but below map elements

        // Set appropriate scale, origin and rotation based on decoration type
        switch (frameIndex) {
            case 0: // Pine tree - taller and slimmer
                decoration.setScale(0.22, 0.22);
                decoration.setOrigin(0.5, 0.8);
                decoration.setRotation(Math.random() * 0.1 - 0.05);
                break;
            case 1: // Deciduous tree - medium sized
                decoration.setScale(0.2, 0.2);
                decoration.setOrigin(0.5, 0.9);
                decoration.setRotation(Math.random() * 0.1 - 0.05);
                break;
            case 2: // Bush - smaller
                decoration.setScale(0.15, 0.15);
                decoration.setOrigin(0.5, 0.7);
                decoration.setRotation(Math.random() * 0.2 - 0.1);
                break;
            case 3: // Rock - smallest
                decoration.setScale(0.12, 0.12);
                decoration.setOrigin(0.5, 0.65);
                decoration.setRotation(Math.random() * 0.3 - 0.15);
                break;
        }
    }

    // Add new method to handle item selection from the React component
    handleItemSelected(frameIndex: number) {
        this.selectedFrameIndex = frameIndex;

        // Create a preview sprite when an item is selected
        if (this.previewSprite) {
            this.previewSprite.destroy();
        }

        // Use the "items" texture for the preview
        this.previewSprite = this.add.sprite(0, 0, "items", frameIndex);
        // Scale down the preview sprite to fit tile size
        this.previewSprite.setScale(64 / 512);
        this.previewSprite.setAlpha(0.5);
        this.previewSprite.setTint(0x00ff00);

        // Hide the preview initially until mouse moves over valid position
        this.previewSprite.visible = false;

        // Enable placing items by clicking on map
        this.input.on("pointerdown", this.handleMapClick, this);
    }

    handleMapClick(pointer: Phaser.Input.Pointer) {
        // Only handle clicks if we have a selected item
        if (!this.selectedFrameIndex || this.isDragging) return;

        const worldPoint = this.cameras.main.getWorldPoint(
            pointer.x,
            pointer.y
        );
        const pointerXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        if (!pointerXY) return;

        const tileX = Math.floor(pointerXY.x);
        const tileY = Math.floor(pointerXY.y);

        if (this.canPlaceItem(tileX, tileY)) {
            this.placeItem(tileX, tileY, this.selectedFrameIndex);
        }
    }

    // Add this method for cleanup
    shutdown() {
        // Clean up all event listeners to prevent memory leaks
        EventBus.removeAllListeners("item-selected");

        // Clean up other resources
        if (this.previewSprite) {
            this.previewSprite.destroy();
            this.previewSprite = null;
        }

        this.itemTiles.forEach((tile) => tile.destroy());
        this.itemTiles = [];
    }
}

