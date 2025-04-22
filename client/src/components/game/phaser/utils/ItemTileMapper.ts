/**
 * This utility maps between user-friendly item indices (1-18) and
 * the actual tile frame indices used in the game.
 */

// The actual tile frame indices used in the game
const ITEM_TILES = [1];

/**
 * Converts a user-friendly index (1-18) to the actual tile frame index
 * @param userIndex Index from 1-18
 * @returns The actual tile frame index or -1 if invalid
 */
export function getUserIndexToTileFrame(userIndex: number): number {
    // Check if the index is valid (1-18)
    if (userIndex < 1 || userIndex > 18) {
        return -1;
    }

    // Convert to 0-based index and get the corresponding tile frame
    return ITEM_TILES[userIndex - 1];
}

/**
 * Converts a tile frame index to the user-friendly index (1-18)
 * @param tileFrame The tile frame index
 * @returns The user-friendly index (1-18) or -1 if not found
 */
export function getTileFrameToUserIndex(tileFrame: number): number {
    const index = ITEM_TILES.indexOf(tileFrame);
    return index === -1 ? -1 : index + 1;
}

/**
 * Returns the full mapping between user indices and tile frames
 * @returns An object with 1-18 keys mapped to tile frame values
 */
export function getItemTileMapping(): Record<string, number> {
    const mapping: Record<string, number> = {};

    ITEM_TILES.forEach((tileFrame, index) => {
        mapping[`${index + 1}`] = tileFrame;
    });

    return mapping;
}

/**
 * Gets all available user-friendly item indices (1-18)
 */
export function getAvailableUserIndices(): number[] {
    return Array.from({ length: ITEM_TILES.length }, (_, i) => i + 1);
}

/**
 * Gets all item tile frames used in the game
 */
export function getAllItemTileFrames(): number[] {
    return [...ITEM_TILES];
}

/**
 * Generates a user-friendly table showing the mapping between user indices (1-18) and tile frame indices
 * @returns A markdown-formatted table string
 */
export function getFormattedMappingTable(): string {
    let table = "| User Index | Tile Frame Index |\n";
    table += "|------------|------------------|\n";

    ITEM_TILES.forEach((tileFrame, index) => {
        table += `| ${index + 1} | ${tileFrame} |\n`;
    });

    return table;
}

/**
 * Logs the mapping table to the console
 */
export function logMappingTable(): void {
    console.table(
        ITEM_TILES.map((tileFrame, index) => ({
            "User Index": index + 1,
            "Tile Frame Index": tileFrame,
        }))
    );
}

