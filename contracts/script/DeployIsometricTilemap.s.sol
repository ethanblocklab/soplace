// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {IsometricTilemap} from "../src/IsometricTilemap.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployIsometricTilemap is Script {
    // Default placement fee is 0.01 ETH
    uint256 public constant DEFAULT_PLACEMENT_FEE = 0.1 ether;
    
    function run() public returns (address, address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 placementFee = vm.envOr("PLACEMENT_FEE", DEFAULT_PLACEMENT_FEE);
        uint8 availableItemCount = 18;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the implementation contract
        IsometricTilemap implementation = new IsometricTilemap();
        
        // Prepare the initialization data
        bytes memory initializeData = abi.encodeWithSelector(
            IsometricTilemap.initialize.selector,
            placementFee,
            availableItemCount
        );
        
        // Deploy the proxy contract pointing to the implementation
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initializeData
        );
        
        vm.stopBroadcast();
        
        // Log the deployment addresses
        console.log("Implementation deployed at:", address(implementation));
        console.log("Proxy deployed at:", address(proxy));
        
        return (address(implementation), address(proxy));
    }
} 