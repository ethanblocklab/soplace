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

== Logs ==
Implementation deployed at: 0xeA909DB6789C28F5a281b2A0145BC8DBa727ab85
Proxy deployed at: 0x920eFEe19B77027dF1428984803d68124bdB271f

✅ [Success] Hash: 0x97803d20379f4df2392e134188e47b16c4c6d8e57f4b87f9a66e73286ca8fd37
Contract Address: 0x920eFEe19B77027dF1428984803d68124bdB271f
Block: 52211161
Paid: 0.00447948 ETH (149316 gas \* 30 gwei)

## License

This project is licensed under the MIT License.
