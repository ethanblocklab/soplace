"use client";

import { useEffect, useRef, useState } from "react";
import {
    IRefPhaserGame,
    PhaserGame,
} from "@/components/game/phaser/PhaserGame";
import { useItemsPlaced } from "@/hooks/useItemsPlaced";
import { EventBus } from "./phaser/EventBus";

export function GameApp() {
    //  References to the PhaserGame component (game and scene are exposed)
    const gameRef = useRef<IRefPhaserGame>(null);
    const [isSceneReady, setIsSceneReady] = useState(false);
    const { data: itemsData, isLoading, error } = useItemsPlaced();

    // Listen for scene ready event
    useEffect(() => {
        const handleSceneReady = () => {
            setIsSceneReady(true);
        };

        EventBus.on("current-scene-ready", handleSceneReady);

        return () => {
            EventBus.removeListener("current-scene-ready", handleSceneReady);
        };
    }, []);

    // When items data is loaded from GraphQL, pass it to the game
    useEffect(() => {
        if (
            itemsData &&
            itemsData.itemPlaceds &&
            gameRef.current?.scene &&
            isSceneReady
        ) {
            // Emit the items-loaded event with the data
            EventBus.emit("items-loaded", itemsData.itemPlaceds);
        }
    }, [itemsData, isSceneReady]);

    return (
        <div className="w-full h-full">
            <PhaserGame ref={gameRef} />
        </div>
    );
}

export default GameApp;

