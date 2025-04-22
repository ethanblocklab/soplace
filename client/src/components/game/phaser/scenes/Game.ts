import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import {
    getAllItemTileFrames,
    getUserIndexToTileFrame,
} from "../utils/ItemTileMapper";
import { getItemDimensions } from "@/data/itemMetadata";

const { IsometricTileToWorldXY } = Phaser.Tilemaps.Components;

const itemWidth = 2224;
const itemHeight = 1626;

interface PlacedItem {
    id: string;
    itemId: number;
    player: string;
    x: number;
    y: number;
    width: number; // Width in tiles
    height: number; // Height in tiles
}

export class Game extends Scene {
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
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
    private minZoom: number = 0.4;
    private maxZoom: number = 2;
    private zoomFactor: number = 0.1;

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

        this.load.tilemapTiledJSON("map", "tiles/soplace-map.json");
        this.load.spritesheet("tiles", "tiles/outside.png", {
            frameWidth: 64,
        });

        // Load decorations spritesheet
        this.load.spritesheet("decorations", "tiles/decor.png", {
            frameWidth: 315,
            frameHeight: 420,
        });
        this.load.spritesheet("items", "tiles/goldmine.png", {
            frameWidth: itemWidth,
            frameHeight: itemHeight,
        });

        this.load.image("background", "tiles/sky_gradient.png");
    }

    create() {
        // Create the map
        this.map = this.add.tilemap("map");

        // Add the tilesets
        const tileset = this.map.addTilesetImage("outside", "tiles");
        if (!tileset) throw new Error("Failed to load tileset");

        const decorTileset = this.map.addTilesetImage("decor", "decorations");
        if (!decorTileset) throw new Error("Failed to load decor tileset");

        // Create the layers
        const layer = this.map.createLayer("Tile Layer 1", tileset);
        if (!layer) throw new Error("Failed to create ground layer");
        this.groundLayer = layer;
        this.groundLayer.setOrigin(0.5, 0);

        // With this implementation
        const decorObjects = this.map.createFromObjects("decoration", [
            {
                gid: 161,
            },
            {
                gid: 162,
            },
            {
                gid: 163,
            },
            {
                gid: 164,
            },
        ]);

        // Adjust sprites after creation
        decorObjects.forEach((obj) => {
            // Set the proper frame if needed (subtracting firstgid)
            if (obj instanceof Phaser.GameObjects.Sprite) {
                obj.setOrigin(1, 0.5);
                obj.setX(obj.x + 32);
                obj.setY(obj.y + 32);
            }
        });

        // Set camera bounds with layer offset
        const mapWidth = this.map.widthInPixels;
        const mapHeight = this.map.heightInPixels;

        this.cameras.main.setBounds(
            -mapWidth / 2,
            0,
            mapWidth + 64,
            mapHeight + 64
        );
        this.cameras.main.setZoom(1); // Set default zoom level

        this.cameras.main.centerOn(0, 0);

        // Add mouse drag functionality for camera movement
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            const worldPoint = this.cameras.main.getWorldPoint(
                pointer.x,
                pointer.y
            );
            const tileXY = this.map.worldToTileXY(
                worldPoint.x,
                worldPoint.y,
                true
            );
            if (pointer.button === 0) {
                // Left click
                // Only enable map dragging if we're not placing an item
                if (!this.selectedFrameIndex) {
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
            if (this.isDragging && !this.selectedFrameIndex) {
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

        // Listen for cancellation events from the React component
        EventBus.on("item-selection-cancelled", () => {
            this.cancelItemSelection();
        });

        // Set up zoom controls
        this.setupZoomControls();

        // Listen for placed items from external sources
        EventBus.on("items-loaded", (items: PlacedItem[]) =>
            this.initPlacedItems(items)
        );

        EventBus.emit("current-scene-ready", this);
    }

    setupZoomControls() {
        // Add zoom keyboard controls
        this.input.keyboard?.on("keydown-PLUS", () => {
            this.zoomIn();
        });

        this.input.keyboard?.on("keydown-MINUS", () => {
            this.zoomOut();
        });

        // Add mousewheel zoom support
        this.input.on(
            "wheel",
            (
                pointer: Phaser.Input.Pointer,
                gameObjects: any,
                deltaX: number,
                deltaY: number
            ) => {
                if (deltaY > 0) {
                    this.zoomOut();
                } else {
                    this.zoomIn();
                }
            }
        );

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
    }

    canPlaceItem(
        tileX: number,
        tileY: number,
        width: number = 1,
        height: number = 1
    ): boolean {
        // Check if any tiles in the area are already occupied
        for (let x = tileX; x < tileX + width; x++) {
            for (let y = tileY; y < tileY + height; y++) {
                // Check if any sprite already exists at this tile position
                const existingItem = this.itemTiles.find(
                    (sprite) =>
                        sprite.getData("tileX") <= x &&
                        sprite.getData("tileX") + sprite.getData("width") > x &&
                        sprite.getData("tileY") <= y &&
                        sprite.getData("tileY") + sprite.getData("height") > y
                );

                if (existingItem) {
                    return false;
                }

                // Ensure the ground tile exists (we can only place on valid ground)
                const groundTile = this.groundLayer.getTileAt(x, y, true);
                if (groundTile === null || groundTile.index === -1) {
                    return false;
                }
            }
        }

        return true;
    }

    placeItem(
        tileX: number,
        tileY: number,
        frameIndex: number,
        width: number = 1,
        height: number = 1
    ) {
        // Send the placement event to the blockchain
        EventBus.emit("place-item", tileX, tileY, frameIndex, width, height);

        // Add event listener for when the item is placed on-chain
        const handleItemPlaced = (success: boolean, error?: Error) => {
            // Remove the listener to avoid memory leaks
            EventBus.removeListener("item-placed", handleItemPlaced);

            if (success) {
                // Convert tile coordinates to world coordinates
                const worldXY = this.map.tileToWorldXY(tileX, tileY);
                if (worldXY) {
                    // Create a sprite instead of placing a tile
                    // Use the same logic as initPlacedItems for positioning and scaling
                    const sprite = this.add
                        .sprite(
                            worldXY.x + 32, // Center horizontally on the base tile
                            worldXY.y + height * 32 + 32, // Adjust Y based on item height and tile height
                            "items",
                            frameIndex
                        )
                        .setOrigin(0.5, 1) // Anchor sprite at bottom-center
                        .setScale(
                            (width * 64) / itemWidth,
                            (height * 32) / itemHeight
                        );

                    // Store the sprite for later management
                    this.itemTiles.push(sprite);

                    // Store data in the sprite for identification
                    sprite.setData("tileX", tileX);
                    sprite.setData("tileY", tileY);
                    sprite.setData("frameIndex", frameIndex);
                    sprite.setData("width", width);
                    sprite.setData("height", height);
                }

                console.log(
                    `Item placed at (${tileX}, ${tileY}) with size ${width}x${height} and type ${frameIndex}`
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
                worldPoint.y,
                true
            );

            if (pointerXY) {
                const tileX = pointerXY.x;
                const tileY = pointerXY.y;
                const width = this.previewSprite.getData("width") || 1;
                const height = this.previewSprite.getData("height") || 1;

                // Make preview visible when over the map
                this.previewSprite.visible = true;

                // Check placement validity and set tint/alpha
                if (this.canPlaceItem(tileX, tileY, width, height)) {
                    this.previewSprite.setAlpha(0.5);
                    this.previewSprite.setTint(0x00ff00); // Green tint for valid placement
                } else {
                    this.previewSprite.setAlpha(0.3);
                    this.previewSprite.setTint(0xff0000); // Red tint for invalid placement
                }

                // Calculate world coordinates for the potential placement tile
                const worldXY = this.map.tileToWorldXY(tileX, tileY);
                if (worldXY) {
                    // Position the preview sprite using the same logic as placed items
                    this.previewSprite.setPosition(
                        worldXY.x + 32, // Center horizontally
                        worldXY.y + height * 32 + 32 // Adjust Y based on item height
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
            const { x, y, itemId, width = 1, height = 1 } = item;

            // Convert the base tile coordinates (top-most corner of the footprint) to world coordinates
            const worldXY = this.map.tileToWorldXY(x, y);

            if (worldXY) {
                // Create a sprite for the item
                // Position using the base tile's world coordinates.
                // Add half tile width to center horizontally on the base tile's diamond.
                // The Y coordinate from tileToWorldXY usually represents the top point of the tile diamond.
                // Setting origin to (0.5, 1) anchors the sprite at its bottom-center.
                const sprite = this.add
                    .sprite(
                        worldXY.x + 32, // Adjust X to center on the tile base (assuming tileWidth = 64)
                        worldXY.y + height * 32 + 32, // Adjust Y to place the bottom of the sprite (origin 1) at the tile's vertical center (assuming tileHeight = 64, isoHeight = 32)
                        "items",
                        itemId
                    )
                    .setOrigin(0.5, 1) // Anchor sprite at bottom-center
                    .setScale(
                        (width * 64) / itemWidth,
                        (height * 32) / itemHeight
                    ); // Scale based on isometric height (32)

                // Store the sprite for later management
                this.itemTiles.push(sprite);

                // Store data in the sprite for identification
                sprite.setData("tileX", x);
                sprite.setData("tileY", y);
                sprite.setData("frameIndex", itemId);
                sprite.setData("width", width);
                sprite.setData("height", height);

                console.log(
                    `Placed sprite for ${itemId} at world (${sprite.x}, ${sprite.y}) with origin (${sprite.originX}, ${sprite.originY})`
                );
            } else {
                console.warn(
                    `Could not convert tile coordinates (${x}, ${y}) to world coordinates.`
                );
            }
        }
    }

    // Add new method to handle item selection from the React component
    handleItemSelected(frameIndex: number) {
        this.selectedFrameIndex = frameIndex;

        // Get dimensions from metadata
        const { width, height } = getItemDimensions(frameIndex);

        // Create a preview sprite when an item is selected
        if (this.previewSprite) {
            this.previewSprite.destroy();
        }

        // Use the "items" texture for the preview
        this.previewSprite = this.add.sprite(0, 0, "items", frameIndex);

        // Scale based on the item size from metadata and the spritesheet dimensions
        const scaleX = (width * 64) / itemWidth;
        const scaleY = (height * 32) / itemHeight; // Use isometric height factor (32)
        this.previewSprite.setScale(scaleX, scaleY);
        this.previewSprite.setOrigin(0.5, 1); // Set origin to bottom-center

        this.previewSprite.setAlpha(0.5);
        this.previewSprite.setTint(0x00ff00); // Default to valid tint

        // Store width and height in the preview sprite for reference
        this.previewSprite.setData("width", width);
        this.previewSprite.setData("height", height);

        // Hide the preview initially until mouse moves over valid position
        this.previewSprite.visible = false;

        // Enable placing items by clicking on map
        this.input.on("pointerdown", this.handleMapClick, this);

        // Add right-click handling to cancel selection
        this.input.on("pointerdown", this.handleRightClick, this);

        // Add Escape key handling to cancel selection
        this.input.keyboard?.on("keydown-ESC", this.cancelItemSelection, this);
    }

    // Add method to handle right-click for cancellation
    handleRightClick(pointer: Phaser.Input.Pointer) {
        // Check if it's a right click (button 2)
        if (pointer.button === 2) {
            this.cancelItemSelection();
        }
    }

    // Add method to cancel item selection
    cancelItemSelection() {
        // Only proceed if we have an active selection
        if (this.selectedFrameIndex === null && !this.previewSprite) return;

        // Clear the selection
        this.selectedFrameIndex = null;

        // Remove the preview sprite
        if (this.previewSprite) {
            this.previewSprite.destroy();
            this.previewSprite = null;
        }

        // Remove the click handlers
        this.input.off("pointerdown", this.handleMapClick, this);
        this.input.off("pointerdown", this.handleRightClick, this);

        // Remove the keyboard handler
        this.input.keyboard?.off("keydown-ESC", this.cancelItemSelection, this);

        // Notify the React component about the cancellation
        EventBus.emit("item-selection-cancelled");
    }

    handleMapClick(pointer: Phaser.Input.Pointer) {
        // Only handle clicks if we have a selected item
        if (!this.selectedFrameIndex || this.isDragging) return;

        // Ignore right clicks in this handler
        if (pointer.button !== 0) return;

        const worldPoint = this.cameras.main.getWorldPoint(
            pointer.x,
            pointer.y
        );
        const pointerXY = this.map.worldToTileXY(
            worldPoint.x,
            worldPoint.y,
            true
        );
        if (!pointerXY) return;

        const tileX = pointerXY.x;
        const tileY = pointerXY.y;
        const width = this.previewSprite?.getData("width") || 1;
        const height = this.previewSprite?.getData("height") || 1;

        if (this.canPlaceItem(tileX, tileY, width, height)) {
            this.placeItem(
                tileX,
                tileY,
                this.selectedFrameIndex,
                width,
                height
            );
            // Optionally, clear selection after placing
            // this.cancelItemSelection();
        }
    }

    // Add this method for cleanup
    shutdown() {
        // Clean up all event listeners to prevent memory leaks
        EventBus.removeAllListeners("item-selected");
        EventBus.removeAllListeners("item-selection-cancelled");

        // Remove keyboard listeners
        this.input.keyboard?.off("keydown-ESC", this.cancelItemSelection, this);

        // Clean up other resources
        if (this.previewSprite) {
            this.previewSprite.destroy();
            this.previewSprite = null;
        }

        this.itemTiles.forEach((tile) => tile.destroy());
        this.itemTiles = [];
    }

    // Add zoom methods
    zoomIn() {
        if (this.cameras.main.zoom < this.maxZoom) {
            this.cameras.main.zoom += this.zoomFactor;
        }
    }

    zoomOut() {
        if (this.cameras.main.zoom > this.minZoom) {
            this.cameras.main.zoom -= this.zoomFactor;
        }
    }
}

