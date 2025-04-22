// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title IsometricTilemap
 * @dev A contract that allows players to place items on a 100x100 isometric tilemap
 */
contract IsometricTilemap is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    uint16 public constant MAP_SIZE = 100;
    
    struct Tile {
        address owner;
        uint8 itemId;
        bool isOccupied;
    }
    
    struct ItemMetadata {
        uint8 width;
        uint8 height;
        bool isConfigured;
    }
    
    mapping(uint16 => mapping(uint16 => Tile)) public tiles;
    mapping(uint8 => ItemMetadata) public itemConfigs;
    uint256 public placementFee;
    uint8 public availableItemCount;
    
    event ItemPlaced(address indexed player, uint16 x, uint16 y, uint8 itemId);
    event ItemUpdated(address indexed player, uint16 x, uint16 y, uint8 newItemId);
    event PlacementFeeChanged(uint256 newFee);
    event ItemConfigured(uint8 itemId, uint8 width, uint8 height);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initializes the contract
     * @param _placementFee The initial fee for placing an item
     */
    function initialize(uint256 _placementFee, uint8 _availableItemCount) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        placementFee = _placementFee;
        availableItemCount = _availableItemCount;
    }
    
    /**
     * @dev Places an item on the map
     * @param x The x coordinate (0-99)
     * @param y The y coordinate (0-99)
     * @param itemId The ID of the item to place (1-18)
     */
    function placeItem(uint16 x, uint16 y, uint8 itemId) external payable nonReentrant {
        require(x < MAP_SIZE && y < MAP_SIZE, "Coordinates out of bounds");
        require(itemId >= 1 && itemId <= availableItemCount, "Invalid item ID");
        require(itemConfigs[itemId].isConfigured, "Item not configured");
        require(msg.value >= placementFee, "Insufficient payment");
        
        // Check if item fits on map bounds
        require(x + itemConfigs[itemId].width <= MAP_SIZE && y + itemConfigs[itemId].height <= MAP_SIZE, 
                "Item exceeds map bounds");
        
        // Check for collisions with existing items
        require(!hasCollision(x, y, itemConfigs[itemId].width, itemConfigs[itemId].height), 
                "Placement would cause collision");
        
        // Mark all tiles occupied by this item
        for (uint8 i = 0; i < itemConfigs[itemId].width; i++) {
            for (uint8 j = 0; j < itemConfigs[itemId].height; j++) {
                tiles[x + i][y + j] = Tile({
                    owner: msg.sender,
                    itemId: itemId,
                    isOccupied: true
                });
            }
        }
        
        emit ItemPlaced(msg.sender, x, y, itemId);
    }
    
    /**
     * @dev Checks if placing an item would cause a collision
     * @param x The x coordinate
     * @param y The y coordinate
     * @param width The width of the item
     * @param height The height of the item
     * @return bool Whether there would be a collision
     */
    function hasCollision(uint16 x, uint16 y, uint8 width, uint8 height) public view returns (bool) {
        for (uint8 i = 0; i < width; i++) {
            for (uint8 j = 0; j < height; j++) {
                if (tiles[x + i][y + j].isOccupied) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * @dev Configure metadata for an item
     * @param itemId The ID of the item to configure
     * @param width The width of the item
     * @param height The height of the item
     */
    function configureItem(uint8 itemId, uint8 width, uint8 height) external onlyOwner {
        require(itemId >= 1 && itemId <= availableItemCount, "Invalid item ID");
        require(width > 0 && height > 0, "Dimensions must be positive");
        
        itemConfigs[itemId] = ItemMetadata({
            width: width,
            height: height,
            isConfigured: true
        });
        
        emit ItemConfigured(itemId, width, height);
    }
    
    /**
     * @dev Returns information about a tile
     * @param x The x coordinate
     * @param y The y coordinate
     * @return owner The address of the owner
     * @return itemId The ID of the item
     * @return isOccupied Whether the tile is occupied
     */
    function getTile(uint16 x, uint16 y) external view returns (address owner, uint8 itemId, bool isOccupied) {
        require(x < MAP_SIZE && y < MAP_SIZE, "Coordinates out of bounds");
        Tile memory tile = tiles[x][y];
        return (tile.owner, tile.itemId, tile.isOccupied);
    }
    
    /**
     * @dev Get item configuration
     * @param itemId The ID of the item
     * @return width The width of the item
     * @return height The height of the item
     */
    function getItemConfig(uint8 itemId) external view returns (uint8 width, uint8 height) {
        require(itemId >= 1 && itemId <= availableItemCount, "Invalid item ID");
        require(itemConfigs[itemId].isConfigured, "Item not configured");
        return (itemConfigs[itemId].width, itemConfigs[itemId].height);
    }
    
    /**
     * @dev Changes the placement fee (only owner)
     * @param _newFee The new fee
     */
    function setPlacementFee(uint256 _newFee) external onlyOwner {
        placementFee = _newFee;
        emit PlacementFeeChanged(_newFee);
    }
    
    /**
     * @dev Withdraws the contract balance to the owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Required by the UUPS module
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 