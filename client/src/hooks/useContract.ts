"use client";

import { useAccount, useWriteContract } from "wagmi";
import {
    isometricTilemapAbi,
    isometricTilemapAddress,
} from "@/config/contracts";

interface PlaceItemParams {
    x: number;
    y: number;
    itemId: number;
}

export function useIsometricTilemapContract() {
    const { address } = useAccount();

    // For writing transactions (placing buildings)
    const { writeContract, isPending, isSuccess, error } = useWriteContract();

    // Function to place a building
    const placeItem = ({ x, y, itemId }: PlaceItemParams) => {
        if (!address) return null;

        writeContract({
            address: isometricTilemapAddress,
            abi: isometricTilemapAbi,
            functionName: "placeItem",
            args: [x, y, itemId],
        });
    };

    return {
        placeItem,
        isPending,
        isSuccess,
        error,
    };
}

