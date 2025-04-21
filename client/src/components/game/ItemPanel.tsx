"use client";

import { useEffect, useState } from "react";
import { EventBus } from "./phaser/EventBus";

export function ItemPanel() {
    const [selectedItemFrame, setSelectedItemFrame] = useState<number | null>(
        null
    );
    const itemTiles = [1];

    const handleItemSelect = (frameIndex: number) => {
        // Toggle behavior - if clicking the same item, cancel the selection
        if (selectedItemFrame === frameIndex) {
            cancelSelection();
            return;
        }

        // Otherwise select the new item
        setSelectedItemFrame(frameIndex);
        EventBus.emit("item-selected", frameIndex);
    };

    // Add function to cancel the selection
    const cancelSelection = () => {
        setSelectedItemFrame(null);
        EventBus.emit("item-selection-cancelled");
    };

    // Add useEffect to listen for selection cancellation
    useEffect(() => {
        // Handle cancellation events from the game
        const handleCancellation = () => {
            setSelectedItemFrame(null);
        };

        // Subscribe to the event
        EventBus.on("item-selection-cancelled", handleCancellation);

        // Clean up event listener when component unmounts
        return () => {
            EventBus.removeListener(
                "item-selection-cancelled",
                handleCancellation
            );
        };
    }, []);

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
                                    "url('/assets/tiles/items.png')",
                                backgroundPosition: `0px 0px`,
                                backgroundSize: "64px 64px",
                                width: "64px",
                                height: "64px",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Show cancel button when an item is selected */}
            {selectedItemFrame !== null && (
                <div className="cancel-button-container">
                    <button className="cancel-button" onClick={cancelSelection}>
                        Cancel Selection
                    </button>
                </div>
            )}

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

                .cancel-button-container {
                    margin-top: 16px;
                    display: flex;
                    justify-content: center;
                }

                .cancel-button {
                    background: rgba(255, 80, 80, 0.7);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: bold;
                }

                .cancel-button:hover {
                    background: rgba(255, 50, 50, 0.9);
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}

