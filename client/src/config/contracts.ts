// Replace with the proxy address after deployment to Somnia testnet
export const isometricTilemapAddress =
    "0x89e325D556d760a38bDA9f15De5359a6B17C75Ad"; // Update after deployment

// Isometric Tilemap Contract ABI
export const isometricTilemapAbi = [
    { type: "constructor", inputs: [], stateMutability: "nonpayable" },
    {
        type: "function",
        name: "MAP_SIZE",
        inputs: [],
        outputs: [{ name: "", type: "uint16", internalType: "uint16" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "UPGRADE_INTERFACE_VERSION",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "availableItemCount",
        inputs: [],
        outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getTile",
        inputs: [
            { name: "x", type: "uint16", internalType: "uint16" },
            { name: "y", type: "uint16", internalType: "uint16" },
        ],
        outputs: [
            { name: "owner", type: "address", internalType: "address" },
            { name: "itemId", type: "uint8", internalType: "uint8" },
            { name: "isOccupied", type: "bool", internalType: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "initialize",
        inputs: [
            { name: "_placementFee", type: "uint256", internalType: "uint256" },
            {
                name: "_availableItemCount",
                type: "uint8",
                internalType: "uint8",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "placeItem",
        inputs: [
            { name: "x", type: "uint16", internalType: "uint16" },
            { name: "y", type: "uint16", internalType: "uint16" },
            { name: "itemId", type: "uint8", internalType: "uint8" },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "placementFee",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "proxiableUUID",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "renounceOwnership",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "setPlacementFee",
        inputs: [{ name: "_newFee", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "tiles",
        inputs: [
            { name: "", type: "uint16", internalType: "uint16" },
            { name: "", type: "uint16", internalType: "uint16" },
        ],
        outputs: [
            { name: "owner", type: "address", internalType: "address" },
            { name: "itemId", type: "uint8", internalType: "uint8" },
            { name: "isOccupied", type: "bool", internalType: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "transferOwnership",
        inputs: [
            { name: "newOwner", type: "address", internalType: "address" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "updateItem",
        inputs: [
            { name: "x", type: "uint16", internalType: "uint16" },
            { name: "y", type: "uint16", internalType: "uint16" },
            { name: "newItemId", type: "uint8", internalType: "uint8" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "upgradeToAndCall",
        inputs: [
            {
                name: "newImplementation",
                type: "address",
                internalType: "address",
            },
            { name: "data", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "withdraw",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        name: "Initialized",
        inputs: [
            {
                name: "version",
                type: "uint64",
                indexed: false,
                internalType: "uint64",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ItemPlaced",
        inputs: [
            {
                name: "player",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "x",
                type: "uint16",
                indexed: false,
                internalType: "uint16",
            },
            {
                name: "y",
                type: "uint16",
                indexed: false,
                internalType: "uint16",
            },
            {
                name: "itemId",
                type: "uint8",
                indexed: false,
                internalType: "uint8",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ItemUpdated",
        inputs: [
            {
                name: "player",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "x",
                type: "uint16",
                indexed: false,
                internalType: "uint16",
            },
            {
                name: "y",
                type: "uint16",
                indexed: false,
                internalType: "uint16",
            },
            {
                name: "newItemId",
                type: "uint8",
                indexed: false,
                internalType: "uint8",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnershipTransferred",
        inputs: [
            {
                name: "previousOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "newOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "PlacementFeeChanged",
        inputs: [
            {
                name: "newFee",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Upgraded",
        inputs: [
            {
                name: "implementation",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "error",
        name: "AddressEmptyCode",
        inputs: [{ name: "target", type: "address", internalType: "address" }],
    },
    {
        type: "error",
        name: "ERC1967InvalidImplementation",
        inputs: [
            {
                name: "implementation",
                type: "address",
                internalType: "address",
            },
        ],
    },
    { type: "error", name: "ERC1967NonPayable", inputs: [] },
    { type: "error", name: "FailedCall", inputs: [] },
    { type: "error", name: "InvalidInitialization", inputs: [] },
    { type: "error", name: "NotInitializing", inputs: [] },
    {
        type: "error",
        name: "OwnableInvalidOwner",
        inputs: [{ name: "owner", type: "address", internalType: "address" }],
    },
    {
        type: "error",
        name: "OwnableUnauthorizedAccount",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
    },
    { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
    { type: "error", name: "UUPSUnauthorizedCallContext", inputs: [] },
    {
        type: "error",
        name: "UUPSUnsupportedProxiableUUID",
        inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }],
    },
];

