"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { useIsometricTilemapContract } from "@/hooks/useContract";

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
                try {
                    placeItem({ x, y, itemId });
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

        // Update the game when transaction status changes
        useEffect(() => {
            if (isSuccess) {
                EventBus.emit("item-placed", true);
            } else if (error) {
                EventBus.emit(
                    "item-placed",
                    false,
                    error instanceof Error ? error : new Error("Unknown error")
                );
            }
        }, [isSuccess, error]);

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

        return (
            <div id="game-container">
                {isPending && (
                    <div className="transaction-status pending">
                        Placing item on the blockchain...
                    </div>
                )}
            </div>
        );
    }
);

