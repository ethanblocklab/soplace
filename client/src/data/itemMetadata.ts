/**
 * Item metadata containing size information and other properties
 * for all available items in the game
 */

export interface ItemMetadata {
    id: number;
    name: string;
    width: number;
    height: number;
    description?: string;
    category?: string;
    rarity?: string;
}

/**
 * Map of all item metadata indexed by itemId
 */
const itemsMetadata: Record<number, ItemMetadata> = {
    1: {
        id: 1,
        name: "Gold Mine",
        width: 3,
        height: 3,
        category: "items",
        description: "Gold Mine",
    },
    2: {
        id: 2,
        name: "Gold Mine",
        width: 3,
        height: 3,
        category: "items",
        description: "Gold Mine",
    },
    3: {
        id: 3,
        name: "Gold Mine",
        width: 3,
        height: 3,
        category: "items",
        description: "Gold Mine",
    },
    11: {
        id: 11,
        name: "Gold Mine",
        width: 3,
        height: 3,
        category: "items",
        description: "Gold Mine",
    },
    16: {
        id: 16,
        name: "Gold Mine",
        width: 3,
        height: 3,
        category: "items",
        description: "Gold Mine",
    },
};

/**
 * Get metadata for an item by its ID
 * @param itemId The ID of the item
 * @returns The item metadata or undefined if not found
 */
export function getItemMetadata(itemId: number): ItemMetadata | undefined {
    return itemsMetadata[itemId];
}

/**
 * Get the dimensions (width and height) of an item by its ID
 * @param itemId The ID of the item
 * @returns Object containing width and height or default values of 1x1 if item not found
 */
export function getItemDimensions(itemId: number): {
    width: number;
    height: number;
} {
    const metadata = itemsMetadata[itemId];
    if (!metadata) {
        console.warn(
            `No metadata found for item ID ${itemId}, using default 1x1 dimensions`
        );
        return { width: 1, height: 1 };
    }
    return { width: metadata.width, height: metadata.height };
}

/**
 * Get all available items
 * @returns Array of all item metadata
 */
export function getAllItems(): ItemMetadata[] {
    return Object.values(itemsMetadata);
}

/**
 * Get items filtered by category
 * @param category The category to filter by
 * @returns Array of item metadata matching the category
 */
export function getItemsByCategory(category: string): ItemMetadata[] {
    return Object.values(itemsMetadata).filter(
        (item) => item.category === category
    );
}

