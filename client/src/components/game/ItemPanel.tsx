"use client";

import { useEffect, useState } from "react";
import { getAllItemTileFrames } from "./phaser/utils/ItemTileMapper";
import { EventBus } from "./phaser/EventBus";

export function ItemPanel() {
    const [selectedItemFrame, setSelectedItemFrame] = useState<number | null>(
        null
    );
    const itemTiles = getAllItemTileFrames();

    const handleItemSelect = (frameIndex: number) => {
        setSelectedItemFrame(frameIndex);
        EventBus.emit("item-selected", frameIndex);
    };

    return (
        <div className="item-panel">
            <h3>Items</h3>
            <div className="item-grid">
                {itemTiles.map((frameIndex, i) => (
                    <div
                        key={i}
                        className={`item-tile ${
                            selectedItemFrame === frameIndex ? "selected" : ""
                        }`}
                        onClick={() => handleItemSelect(frameIndex)}
                    >
                        <div
                            className="item-sprite"
                            style={{
                                backgroundImage:
                                    "url('/assets/tiles/outside.png')",
                                backgroundPosition: `${
                                    -(frameIndex % 30) * 64
                                }px ${-Math.floor(frameIndex / 30) * 64}px`,
                                width: "64px",
                                height: "64px",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                    </div>
                ))}
            </div>

            <style jsx>{`
                .item-panel {
                    background: rgba(0, 0, 0, 0.7);
                    border-radius: 8px;
                    padding: 16px;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    position: absolute;
                    left: 32px;
                    top: 32px;
                    z-index: 10;
                    max-height: 400px;
                    overflow-y: auto;
                }

                h3 {
                    margin-top: 0;
                    margin-bottom: 12px;
                    color: #ffd700;
                }

                .item-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }

                .item-tile {
                    width: 64px;
                    height: 64px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 2px solid transparent;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .item-tile:hover {
                    transform: scale(1.1);
                    border-color: #66ff66;
                }

                .item-tile.selected {
                    border-color: #66ff66;
                    background: rgba(102, 255, 102, 0.2);
                }
            `}</style>
        </div>
    );
}

