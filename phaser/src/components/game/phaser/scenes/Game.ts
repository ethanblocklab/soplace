import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Game extends Scene {
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private draggedTile: Phaser.GameObjects.Sprite | null = null;
    private previewSprite: Phaser.GameObjects.Sprite | null = null;
    private buildingTiles: Phaser.GameObjects.Sprite[] = [];
    private map!: Phaser.Tilemaps.Tilemap;
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private buildingLayer!: Phaser.Tilemaps.TilemapLayer;
    // private clouds: Phaser.GameObjects.Image[] = [];
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private cameraStartX: number = 0;
    private cameraStartY: number = 0;

    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets");
        this.load.tilemapTiledJSON("map", "tiles/map2.json");
        this.load.spritesheet("tiles", "tiles/outside.png", {
            frameWidth: 64,
        });
        // this.load.spritesheet("buildings", "tiles/building.png", {
        //     frameWidth: 64,
        // });
        this.load.image("background", "tiles/sky_gradient.png");
        // this.load.spritesheet("clouds", "tiles/cloud_sprite.png", {
        //     frameWidth: 64,
        //     frameHeight: 64,
        //     margin: 0,
        //     spacing: 0,
        // });
    }

    create() {
        const bg = this.add
            .image(0, 0, "background")
            .setOrigin(0, 0)
            .setDisplaySize(1024, 768)
            .setScrollFactor(0, 0)
            .setDepth(-2);

        // this.createClouds();

        // Create the map
        this.map = this.add.tilemap("map");

        // Add the tilesets
        const tileset = this.map.addTilesetImage("outside", "tiles");
        if (!tileset) throw new Error("Failed to load tileset");

        // Create the layers
        const layer = this.map.createLayer("Tile Layer 1", tileset);
        if (!layer) throw new Error("Failed to create ground layer");
        this.groundLayer = layer;

        // const buildingTileset = this.map.addTilesetImage(
        //     "building",
        //     "buildings"
        // );
        // if (!buildingTileset)
        //     throw new Error("Failed to load building tileset");

        const buildingLayer = this.map.createBlankLayer(
            "Tile Layer 2",
            tileset
        );

        if (!buildingLayer) throw new Error("Failed to create building layer");
        this.buildingLayer = buildingLayer;

        // Set camera bounds with layer offset
        const mapWidth = this.map.widthInPixels;
        const mapHeight = this.map.heightInPixels;

        this.cameras.main.setBounds(-mapWidth / 2, 0, mapWidth, mapHeight);

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

        this.createBuildingPanel();

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

        EventBus.emit("current-scene-ready", this);
    }

    createBuildingPanel() {
        const panelX = 32;
        // const panelY = 0;
        const tileSize = 64;
        const padding = 10;
        const columns = 4;
        const containerHeight = 400; // Fixed height for the container

        // Create a background rectangle for the panel
        const background = this.add.rectangle(
            (columns * (tileSize + padding) + padding) / 2,
            containerHeight / 2,
            columns * (tileSize + padding) + padding,
            containerHeight,
            0x000000,
            0.5
        );
        background.setScrollFactor(0);

        const buildingTiles = [
            50, 51, 80, 81, 84, 86, 110, 111, 112, 116, 117, 119, 120, 121, 124,
            125, 128, 129,
        ];
        for (let i = 0; i < buildingTiles.length; i++) {
            const row = Math.floor(i / columns);
            const col = i % columns;
            const x = padding + col * (tileSize + padding);
            const y = padding + 50 + row * (tileSize + padding);

            const tile = this.add
                // .sprite(x, y, "buildings", i)
                .sprite(panelX + x, y, "tiles", buildingTiles[i])
                .setInteractive()
                // .setData("frameIndex", i + 161);
                .setData("frameIndex", buildingTiles[i]);

            tile.setScrollFactor(0);

            // Add hover effect
            tile.on("pointerover", () => {
                tile.setTint(0x66ff66);
                tile.setScale(1.1);
            });

            tile.on("pointerout", () => {
                tile.clearTint();
                tile.setScale(1);
            });

            this.input.setDraggable(tile);
            this.buildingTiles.push(tile);
        }

        // const container = this.add.container(
        //     panelX,
        //     panelY,
        //     this.buildingTiles
        // );
        // container.setScrollFactor(0);
    }

    onDragStart(
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite
    ) {
        this.isDragging = false;
        this.draggedTile = gameObject;

        const frameIndex = gameObject.getData("frameIndex");

        this.previewSprite = this.add
            .sprite(0, 0, "tiles", frameIndex)
            .setAlpha(0.5);

        const worldPoint = this.input.activePointer.positionToCamera(
            this.cameras.main
        ) as Phaser.Math.Vector2;

        const tileX = this.map.worldToTileX(worldPoint.x);
        const tileY = this.map.worldToTileY(worldPoint.y);

        this.previewSprite.setPosition(
            this.map.tileToWorldX(tileX) + 32,
            this.map.tileToWorldY(tileY) + 32
        );
    }

    onDrag(
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite,
        dragX: number,
        dragY: number
    ) {
        const worldPoint = this.input.activePointer.positionToCamera(
            this.cameras.main
        ) as Phaser.Math.Vector2;

        const snappedWorldPoint = {
            x: Math.floor(worldPoint.x / 64) * 64 + this.map.tileWidth / 2,
            y: Math.floor(worldPoint.y / 64) * 64 + this.map.tileHeight / 2,
        };

        if (this.previewSprite) {
            const canPlace = this.canPlaceBuilding(
                this.map.worldToTileX(snappedWorldPoint.x),
                this.map.worldToTileY(snappedWorldPoint.y)
            );

            this.previewSprite.setPosition(
                snappedWorldPoint.x,
                snappedWorldPoint.y
            );

            this.previewSprite.setTint(canPlace ? 0x00ff00 : 0xff0000);
        }
    }

    onDragEnd(
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite
    ) {
        const worldPoint = this.input.activePointer.positionToCamera(
            this.cameras.main
        ) as Phaser.Math.Vector2;

        const tileX = this.map.worldToTileX(worldPoint.x);
        const tileY = this.map.worldToTileY(worldPoint.y);

        const snappedWorldPoint = {
            x: tileX * 64 + this.map.tileWidth / 2,
            y: tileY * 64 + this.map.tileHeight / 2,
        };

        // Only place if it's a valid position
        if (
            tileX >= 0 &&
            tileY >= 0 &&
            tileX < this.map.width &&
            tileY < this.map.height
        ) {
            const frameIndex = gameObject.getData("frameIndex");
            if (this.canPlaceBuilding(tileX, tileY)) {
                this.placeBuilding(tileX, tileY, frameIndex);
            }
        }

        if (this.previewSprite) {
            this.previewSprite.destroy();
            this.previewSprite = null;
        }

        this.draggedTile = null;
    }

    canPlaceBuilding(tileX: number, tileY: number): boolean {
        if (
            tileX < 0 ||
            tileY < 0 ||
            tileX >= this.map.width ||
            tileY >= this.map.height
        ) {
            return false;
        }
        return true;
    }

    placeBuilding(tileX: number, tileY: number, frameIndex: number) {
        if (this.groundLayer.getTileAt(tileX, tileY)) {
            const newTile = this.buildingLayer.putTileAt(
                frameIndex + 1,
                tileX,
                tileY
            );
            if (newTile) {
                newTile.setAlpha(1);
            }
        }
    }

    update(time: number, delta: number) {
        this.controls.update(delta);
    }
}
