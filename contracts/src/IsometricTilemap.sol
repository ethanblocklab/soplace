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
    
    mapping(uint16 => mapping(uint16 => Tile)) public tiles;
    uint256 public placementFee;
    uint8 public availableItemCount;
    
    event ItemPlaced(address indexed player, uint16 x, uint16 y, uint8 itemId);
    event ItemUpdated(address indexed player, uint16 x, uint16 y, uint8 newItemId);
    event PlacementFeeChanged(uint256 newFee);
    
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
        require(!tiles[x][y].isOccupied, "Tile already occupied");
        require(msg.value >= placementFee, "Insufficient payment");
        
        tiles[x][y] = Tile({
            owner: msg.sender,
            itemId: itemId,
            isOccupied: true
        });
        
        emit ItemPlaced(msg.sender, x, y, itemId);
    }
    
    /**
     * @dev Updates an item on the map (only the owner can update their item)
     * @param x The x coordinate
     * @param y The y coordinate
     * @param newItemId The new ID of the item to place (1-18)
     */
    function updateItem(uint16 x, uint16 y, uint8 newItemId) external {
        require(x < MAP_SIZE && y < MAP_SIZE, "Coordinates out of bounds");
        require(newItemId >= 0 && newItemId <= availableItemCount, "Invalid item ID");
        require(tiles[x][y].isOccupied, "Tile is not occupied");
        require(tiles[x][y].owner == msg.sender, "Not the owner of this item");
        
        tiles[x][y].itemId = newItemId;
        
        emit ItemUpdated(msg.sender, x, y, newItemId);
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