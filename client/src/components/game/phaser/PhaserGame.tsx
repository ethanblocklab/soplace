"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { useIsometricTilemapContract } from "@/hooks/useContract";
import { toast } from "sonner";
import { getTileFrameToUserIndex } from "./utils/ItemTileMapper";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame({ currentActiveScene }, ref) {
        const game = useRef<Phaser.Game | null>(null!);
        const { placeItem, isPending, isSuccess, error } =
            useIsometricTilemapContract();

        // Handle contract interactions
        useEffect(() => {
            // Listen for place-item events from the Game scene
            const handlePlaceItem = (x: number, y: number, itemId: number) => {
                console.log("Placing item on the blockchain...", itemId);
                // Check if itemId is a user index (1-18) and convert if needed
                const tileFrameIndex = getTileFrameToUserIndex(itemId);
                console.log("Tile frame index:", tileFrameIndex);
                if (tileFrameIndex === -1) {
                    toast.error("Invalid item ID", { id: itemId });
                    return;
                }

                try {
                    placeItem({ x, y, itemId: tileFrameIndex });
                } catch (err) {
                    EventBus.emit(
                        "item-placed",
                        false,
                        err instanceof Error ? err : new Error("Unknown error")
                    );
                }
            };

            EventBus.on("place-item", handlePlaceItem);

            return () => {
                EventBus.removeListener("place-item", handlePlaceItem);
            };
        }, [placeItem]);

        // Show toast for pending transactions
        useEffect(() => {
            const toastId = "transaction-toast";

            if (isPending) {
                toast.loading("Placing item on the blockchain...", {
                    id: toastId,
                });
            } else if (isSuccess) {
                toast.success("Item successfully placed!", { id: toastId });
                EventBus.emit("item-placed", true);
            } else if (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to place item",
                    { id: toastId }
                );
                EventBus.emit(
                    "item-placed",
                    false,
                    error instanceof Error ? error : new Error("Unknown error")
                );
            }
        }, [isPending, isSuccess, error]);

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container");

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }
            }

            return () => {
                if (game.current) {
                    game.current.destroy(true);
                    if (game.current !== null) {
                        game.current = null;
                    }
                }
            };
        }, [ref]);

        useEffect(() => {
            const handleSceneReady = (scene_instance: Phaser.Scene) => {
                if (
                    currentActiveScene &&
                    typeof currentActiveScene === "function"
                ) {
                    currentActiveScene(scene_instance);
                }

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: scene_instance });
                } else if (ref) {
                    ref.current = {
                        game: game.current,
                        scene: scene_instance,
                    };
                }
            };

            EventBus.on("current-scene-ready", handleSceneReady);

            return () => {
                EventBus.removeListener(
                    "current-scene-ready",
                    handleSceneReady
                );
            };
        }, [currentActiveScene, ref]);

        return <div id="game-container"></div>;
    }
);

