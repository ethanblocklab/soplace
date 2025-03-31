import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { ItemPlaced as ItemPlacedEvent } from '../generated/IsometricTilemap/IsometricTilemap'
import { ItemPlaced } from '../generated/schema'

export function handleItemPlaced(event: ItemPlacedEvent): void {
  // Create a unique ID by combining x and y coordinates with a separator
  // Using a consistent pattern: x-y (as a string converted to bytes)
  let id = Bytes.fromUTF8(
    event.params.x.toString() + '-' + event.params.y.toString(),
  )

  // Check if an entity with this position already exists
  let entity = ItemPlaced.load(id)
  if (entity == null) {
    entity = new ItemPlaced(id)
  }

  entity.player = event.params.player
  entity.x = event.params.x
  entity.y = event.params.y
  entity.itemId = event.params.itemId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
