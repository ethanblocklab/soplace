// Isometric Tilemap Contract ABI
export const isometricTilemapAbi = [
    {
        inputs: [
            {
                internalType: "uint16",
                name: "x",
                type: "uint16",
            },
            {
                internalType: "uint16",
                name: "y",
                type: "uint16",
            },
            {
                internalType: "uint8",
                name: "itemId",
                type: "uint8",
            },
        ],
        name: "placeItem",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "x",
                type: "uint16",
            },
            {
                internalType: "uint16",
                name: "y",
                type: "uint16",
            },
            {
                internalType: "uint8",
                name: "newItemId",
                type: "uint8",
            },
        ],
        name: "updateItem",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "x",
                type: "uint16",
            },
            {
                internalType: "uint16",
                name: "y",
                type: "uint16",
            },
        ],
        name: "getTile",
        outputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "uint8",
                name: "itemId",
                type: "uint8",
            },
            {
                internalType: "bool",
                name: "isOccupied",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];

// Replace with the proxy address after deployment to Somnia testnet
export const isometricTilemapAddress =
    "0x0000000000000000000000000000000000000000"; // Update after deployment

