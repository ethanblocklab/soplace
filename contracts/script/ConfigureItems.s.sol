// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {IsometricTilemap} from "../src/IsometricTilemap.sol";

contract ConfigureItemsScript is Script {
    function run() external {
        // Load the private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address tilemapAddress = vm.envAddress("TILEMAP_ADDRESS");
        
        // Start broadcast
        vm.startBroadcast(deployerPrivateKey);
        
        // Access the deployed contract
        IsometricTilemap tilemap = IsometricTilemap(tilemapAddress);
        
        // Configure item id 1 with width 3, height 3
        tilemap.configureItem(1, 3, 3);
        
        // End broadcast
        vm.stopBroadcast();
        
        // Log output (only visible when running with -vvv)
        console.log("Item 1 configured with width 3, height 3");
    }
} 