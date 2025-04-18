"use client";

import {
    forwardRef,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
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
        const [loadingProgress, setLoadingProgress] = useState(0);
        const [isLoading, setIsLoading] = useState(true);
        const { placeItem, isPending, isSuccess, error } =
            useIsometricTilemapContract();

        // Handle loading progress
        useEffect(() => {
            const handleLoadingProgress = (progress: number) => {
                setLoadingProgress(progress);
                if (progress >= 1) {
                    // Add a small delay before hiding the progress bar
                    setTimeout(() => setIsLoading(false), 500);
                }
            };

            EventBus.on("loading-progress", handleLoadingProgress);

            return () => {
                EventBus.removeListener(
                    "loading-progress",
                    handleLoadingProgress
                );
            };
        }, []);

        // Handle contract interactions
        useEffect(() => {
            // Listen for place-item events from the Game scene
            const handlePlaceItem = (x: number, y: number, itemId: number) => {
                // Check if itemId is a user index (1-18) and convert if needed
                const tileFrameIndex = getTileFrameToUserIndex(itemId);

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
                toast.loading("Placing item on the blockchain (0.1 STT)...", {
                    id: toastId,
                });
            } else if (isSuccess) {
                toast.success("Item successfully placed!", { id: toastId });
                EventBus.emit("item-placed", true);
            } else if (error) {
                // Check if it's a user cancellation
                if (
                    error instanceof Error &&
                    error.message.includes("User rejected the request")
                ) {
                    toast.error("Transaction cancelled", { id: toastId });
                } else {
                    toast.error(
                        error instanceof Error
                            ? error.message
                            : "Failed to place item",
                        { id: toastId }
                    );
                }

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

        return (
            <>
                {isLoading && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "300px",
                            zIndex: 1000,
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                backgroundColor: "#444",
                                borderRadius: "4px",
                                padding: "2px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                            }}
                        >
                            <div
                                style={{
                                    height: "20px",
                                    width: `${loadingProgress * 100}%`,
                                    backgroundColor: "#4CAF50",
                                    borderRadius: "2px",
                                    transition: "width 0.3s ease-in-out",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "8px",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "bold",
                            }}
                        >
                            Loading Game... {Math.floor(loadingProgress * 100)}%
                        </div>
                    </div>
                )}
                <div
                    id="game-container"
                    style={{
                        width: "100vw",
                        height: "100vh",
                        margin: 0,
                        padding: 0,
                        visibility: isLoading ? "hidden" : "visible",
                        overflow: "hidden",
                    }}
                ></div>
            </>
        );
    }
);

