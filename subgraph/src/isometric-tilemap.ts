import {
  Initialized as InitializedEvent,
  ItemPlaced as ItemPlacedEvent,
  ItemUpdated as ItemUpdatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PlacementFeeChanged as PlacementFeeChangedEvent,
  Upgraded as UpgradedEvent
} from "../generated/IsometricTilemap/IsometricTilemap"
import {
  Initialized,
  ItemPlaced,
  ItemUpdated,
  OwnershipTransferred,
  PlacementFeeChanged,
  Upgraded
} from "../generated/schema"

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleItemPlaced(event: ItemPlacedEvent): void {
  let entity = new ItemPlaced(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.player = event.params.player
  entity.x = event.params.x
  entity.y = event.params.y
  entity.itemId = event.params.itemId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleItemUpdated(event: ItemUpdatedEvent): void {
  let entity = new ItemUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.player = event.params.player
  entity.x = event.params.x
  entity.y = event.params.y
  entity.newItemId = event.params.newItemId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlacementFeeChanged(
  event: PlacementFeeChangedEvent
): void {
  let entity = new PlacementFeeChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
