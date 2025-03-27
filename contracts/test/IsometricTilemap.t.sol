// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {IsometricTilemap} from "../src/IsometricTilemap.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract IsometricTilemapTest is Test {
    IsometricTilemap public implementation;
    IsometricTilemap public tilemap;
    address public owner;
    address public user1;
    address public user2;
    
    uint256 public constant PLACEMENT_FEE = 0.01 ether;
    uint8 public constant AVAILABLE_ITEM_COUNT = 18;
    
    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        vm.startPrank(owner);
        
        // Deploy the implementation contract
        implementation = new IsometricTilemap();
        
        // Deploy the proxy contract
        bytes memory initializeData = abi.encodeWithSelector(
            IsometricTilemap.initialize.selector,
            PLACEMENT_FEE,
            AVAILABLE_ITEM_COUNT
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initializeData
        );
        
        // Create the proxy interface
        tilemap = IsometricTilemap(address(proxy));
        
        vm.stopPrank();
    }
    
    function testInitialState() public {
        assertEq(tilemap.placementFee(), PLACEMENT_FEE);
        assertEq(tilemap.MAP_SIZE(), 100);
        assertEq(tilemap.availableItemCount(), AVAILABLE_ITEM_COUNT);
    }
    
    function testPlaceItem() public {
        uint16 x = 10;
        uint16 y = 20;
        uint8 itemId = 5;
        
        vm.deal(user1, 1 ether);
        
        vm.startPrank(user1);
        tilemap.placeItem{value: PLACEMENT_FEE}(x, y, itemId);
        vm.stopPrank();
        
        (address tileOwner, uint8 tileItemId, bool isOccupied) = tilemap.getTile(x, y);
        
        assertEq(tileOwner, user1);
        assertEq(tileItemId, itemId);
        assertTrue(isOccupied);
    }
    
    function testPlaceItemWithExcessPayment() public {
        uint16 x = 15;
        uint16 y = 25;
        uint8 itemId = 7;
        uint256 payment = PLACEMENT_FEE + 0.01 ether;
        
        vm.deal(user1, 1 ether);
        
        uint256 balanceBefore = user1.balance;
        
        vm.startPrank(user1);
        tilemap.placeItem{value: payment}(x, y, itemId);
        vm.stopPrank();
        
        uint256 balanceAfter = user1.balance;
        uint256 actualFee = balanceBefore - balanceAfter;
        
        assertEq(actualFee, payment);
    }
    
    function testCannotPlaceItemInOccupiedTile() public {
        uint16 x = 30;
        uint16 y = 40;
        
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        
        vm.startPrank(user1);
        tilemap.placeItem{value: PLACEMENT_FEE}(x, y, 1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        vm.expectRevert("Tile already occupied");
        tilemap.placeItem{value: PLACEMENT_FEE}(x, y, 2);
        vm.stopPrank();
    }
    
    function testCannotPlaceItemWithInsufficientPayment() public {
        uint256 insufficientPayment = PLACEMENT_FEE - 0.001 ether;
        
        vm.deal(user1, 1 ether);
        
        vm.startPrank(user1);
        vm.expectRevert("Insufficient payment");
        tilemap.placeItem{value: insufficientPayment}(5, 5, 1);
        vm.stopPrank();
    }
    
    function testCannotPlaceItemOutOfBounds() public {
        uint16 outOfBoundsX = 100; // MAP_SIZE is 100, so valid indices are 0-99
        
        vm.deal(user1, 1 ether);
        
        vm.startPrank(user1);
        vm.expectRevert("Coordinates out of bounds");
        tilemap.placeItem{value: PLACEMENT_FEE}(outOfBoundsX, 5, 1);
        vm.stopPrank();
    }
    
    function testUpdateItem() public {
        uint16 x = 50;
        uint16 y = 60;
        uint8 itemId = 9;
        uint8 newItemId = 15;
        
        vm.deal(user1, 1 ether);
        
        vm.startPrank(user1);
        tilemap.placeItem{value: PLACEMENT_FEE}(x, y, itemId);
        tilemap.updateItem(x, y, newItemId);
        vm.stopPrank();
        
        (address tileOwner, uint8 tileItemId, bool isOccupied) = tilemap.getTile(x, y);
        
        assertEq(tileOwner, user1);
        assertEq(tileItemId, newItemId);
        assertTrue(isOccupied);
    }
    
    function testCannotUpdateItemNotOwned() public {
        uint16 x = 70;
        uint16 y = 80;
        uint8 itemId = 11;
        uint8 newItemId = 16;
        
        vm.deal(user1, 1 ether);
        
        vm.startPrank(user1);
        tilemap.placeItem{value: PLACEMENT_FEE}(x, y, itemId);
        vm.stopPrank();
        
        vm.startPrank(user2);
        vm.expectRevert("Not the owner of this item");
        tilemap.updateItem(x, y, newItemId);
        vm.stopPrank();
    }
    
    function testSetPlacementFee() public {
        uint256 newFee = 0.02 ether;
        
        vm.startPrank(owner);
        tilemap.setPlacementFee(newFee);
        vm.stopPrank();
        
        assertEq(tilemap.placementFee(), newFee);
    }
    
    function testOnlyOwnerCanSetPlacementFee() public {
        vm.startPrank(user1);
        vm.expectRevert();
        tilemap.setPlacementFee(0.05 ether);
        vm.stopPrank();
    }
    
    function testWithdraw() public {
        uint16 x = 5;
        uint16 y = 5;
        
        vm.deal(user1, 1 ether);
        
        vm.startPrank(user1);
        tilemap.placeItem{value: PLACEMENT_FEE}(x, y, 1);
        vm.stopPrank();
        
        uint256 ownerBalanceBefore = owner.balance;
        
        vm.startPrank(owner);
        tilemap.withdraw();
        vm.stopPrank();
        
        uint256 ownerBalanceAfter = owner.balance;
        
        assertEq(ownerBalanceAfter - ownerBalanceBefore, PLACEMENT_FEE);
        assertEq(address(tilemap).balance, 0);
    }
    
    function testCannotWithdrawWithEmptyBalance() public {
        vm.startPrank(owner);
        vm.expectRevert("No balance to withdraw");
        tilemap.withdraw();
        vm.stopPrank();
    }
} 