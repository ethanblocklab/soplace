"use client";

import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { soPlaceAbi, soPlaceAddress } from "@/config/contracts";

interface PlaceBuildingParams {
    x: number;
    y: number;
    buildingType: number;
}

export function useSoPlaceContract() {
    const { address } = useAccount();

    // For writing transactions (placing buildings)
    const {
        writeContract: writeContractRaw,
        isPending,
        isSuccess,
        error,
    } = useWriteContract();

    // Function to place a building
    const placeBuilding = async ({
        x,
        y,
        buildingType,
    }: PlaceBuildingParams) => {
        if (!address) return null;

        return writeContractRaw({
            address: soPlaceAddress,
            abi: soPlaceAbi,
            functionName: "placeBuilding",
            args: [x, y, buildingType],
        });
    };

    // For reading from the contract
    const { data: buildingData, refetch } = useReadContract({
        address: soPlaceAddress,
        abi: soPlaceAbi,
        functionName: "getBuildingAt",
        args: [0, 0], // Default values, should be changed when calling
    });

    // Function to get a building at a specific location
    const getBuildingAt = async (x: number, y: number) => {
        return useReadContract({
            address: soPlaceAddress,
            abi: soPlaceAbi,
            functionName: "getBuildingAt",
            args: [x, y],
        });
    };

    return {
        placeBuilding,
        getBuildingAt,
        isPending,
        isSuccess,
        error,
        refetch,
    };
}
