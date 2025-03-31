import { EventEmitter } from "events";

// Define types for events
export interface EventTypes {
    "current-scene-ready": (scene: Phaser.Scene) => void;
    "place-item": (x: number, y: number, itemType: number) => void;
    "item-placed": (success: boolean, error?: Error) => void;
}

// Create a typed EventEmitter
export const EventBus = new EventEmitter();

export default EventBus;

