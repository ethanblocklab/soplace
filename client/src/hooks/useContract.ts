"use client";

import { useAccount, useWriteContract } from "wagmi";
import {
    isometricTilemapAbi,
    isometricTilemapAddress,
} from "@/config/contracts";
import { parseEther } from "viem";

interface PlaceItemParams {
    x: number;
    y: number;
    itemId: number;
}

export function useIsometricTilemapContract() {
    const { address } = useAccount();

    // For writing transactions (placing items)
    const { writeContract, isPending, isSuccess, error } = useWriteContract();

    // Function to place an item
    const placeItem = ({ x, y, itemId }: PlaceItemParams) => {
        if (!address) return null;

        writeContract({
            address: isometricTilemapAddress,
            abi: isometricTilemapAbi,
            functionName: "placeItem",
            args: [x, y, itemId],
            value: parseEther("0.1"),
        });
    };

    return {
        placeItem,
        isPending,
        isSuccess,
        error,
    };
}

