import { EventEmitter } from "events";

// Define types for events
export type EventTypes =
    | "place-item"
    | "item-placed"
    | "items-loaded"
    | "current-scene-ready"
    | "loading-progress";

// Create a typed EventEmitter
export const EventBus = new EventEmitter();

export default EventBus;

