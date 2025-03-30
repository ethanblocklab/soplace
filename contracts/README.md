# Isometric Tilemap Smart Contract

This project contains a smart contract for an isometric tilemap where players can place items for a fee.

## Overview

The `IsometricTilemap` contract allows:

- Players to place items on a 100x100 isometric tilemap
- Each placement costs ETH (configurable by owner)
- Items are referenced by a number ID
- Players can only remove their own items
- Owner can withdraw accumulated ETH

## Contract Features

- **Upgradeable**: Uses OpenZeppelin's UUPS upgradeable pattern
- **Secure**: Implements reentrancy protection and access control
- **Configurable**: Owner can adjust the placement fee
- **Efficient**: Optimized for gas usage

## Development Setup

1. Clone the repository
2. Install Foundry if you haven't already:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```
3. Install dependencies:
   ```bash
   forge install
   ```

## Testing

Run the tests with:

```bash
forge test
```

## Deployment

To deploy the contract:

1. Set up your environment variables:

   ```bash
   export PRIVATE_KEY=your_private_key
   export PLACEMENT_FEE=10000000000000000  # Optional: 0.01 ETH in wei
   ```

2. Run the deployment script:
   ```bash
   forge script script/DeployIsometricTilemap.s.sol --rpc-url <your_rpc_url> --broadcast
   ```

## Contract Interaction

### Placing an Item

To place an item at coordinates (x,y) with item ID:

```solidity
// Send the required placement fee
tilemap.placeItem{value: placementFee}(x, y, itemId);
```

### Removing an Item

To remove your item from coordinates (x,y):

```solidity
tilemap.removeItem(x, y);
```

### Checking a Tile

To check what's on a tile:

```solidity
(address owner, uint256 itemId, bool isOccupied) = tilemap.getTile(x, y);
```

## Security Considerations

- The contract includes protections against common vulnerabilities
- Funds can only be withdrawn by the owner
- Players can only modify their own placements

## Deployment

Implementation deployed at: 0x12B1247B11c02CC8Dce4f984f7A7fE7Cef9b7E67
Proxy deployed at: 0x25347B4f8449cCCDEEB52912c0d0d3a1613C98E4

## License

This project is licensed under the MIT License.
