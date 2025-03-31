import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Initialized,
  ItemPlaced,
  ItemUpdated,
  OwnershipTransferred,
  PlacementFeeChanged,
  Upgraded
} from "../generated/IsometricTilemap/IsometricTilemap"

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createItemPlacedEvent(
  player: Address,
  x: i32,
  y: i32,
  itemId: i32
): ItemPlaced {
  let itemPlacedEvent = changetype<ItemPlaced>(newMockEvent())

  itemPlacedEvent.parameters = new Array()

  itemPlacedEvent.parameters.push(
    new ethereum.EventParam("player", ethereum.Value.fromAddress(player))
  )
  itemPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "x",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(x))
    )
  )
  itemPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "y",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(y))
    )
  )
  itemPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "itemId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(itemId))
    )
  )

  return itemPlacedEvent
}

export function createItemUpdatedEvent(
  player: Address,
  x: i32,
  y: i32,
  newItemId: i32
): ItemUpdated {
  let itemUpdatedEvent = changetype<ItemUpdated>(newMockEvent())

  itemUpdatedEvent.parameters = new Array()

  itemUpdatedEvent.parameters.push(
    new ethereum.EventParam("player", ethereum.Value.fromAddress(player))
  )
  itemUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "x",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(x))
    )
  )
  itemUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "y",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(y))
    )
  )
  itemUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newItemId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newItemId))
    )
  )

  return itemUpdatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPlacementFeeChangedEvent(
  newFee: BigInt
): PlacementFeeChanged {
  let placementFeeChangedEvent = changetype<PlacementFeeChanged>(newMockEvent())

  placementFeeChangedEvent.parameters = new Array()

  placementFeeChangedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return placementFeeChangedEvent
}

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}
