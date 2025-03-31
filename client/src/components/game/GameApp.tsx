"use client";

import { useEffect, useRef } from "react";
import {
    IRefPhaserGame,
    PhaserGame,
} from "@/components/game/phaser/PhaserGame";
import { useItemsPlaced } from "@/hooks/useItemsPlaced";
import { EventBus } from "./phaser/EventBus";

export function GameApp() {
    //  References to the PhaserGame component (game and scene are exposed)
    const gameRef = useRef<IRefPhaserGame>(null);
    const { data: itemsData, isLoading, error } = useItemsPlaced();

    // When items data is loaded from GraphQL, pass it to the game
    useEffect(() => {
        if (itemsData && itemsData.itemPlaceds && gameRef.current?.scene) {
            // Emit the items-loaded event with the data
            EventBus.emit("items-loaded", itemsData.itemPlaceds);
        }
    }, [itemsData, gameRef.current?.scene]);

    const addSprite = () => {
        if (gameRef.current) {
            const scene = gameRef.current.scene;

            if (scene) {
                // Add a new sprite to the current scene at a random position
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);

                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                scene.add.sprite(x, y, "star");
            }
        }
    };

    return (
        <div className="w-full h-full">
            <PhaserGame ref={gameRef} />
            {/* <div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
            </div> */}
        </div>
    );
}

export default GameApp;

