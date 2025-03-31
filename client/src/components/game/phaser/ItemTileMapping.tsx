"use client";

import {
    getItemTileMapping,
    getAvailableUserIndices,
} from "./utils/ItemTileMapper";

interface ItemTileMappingProps {
    showDetails?: boolean;
}

export function ItemTileMapping({ showDetails = false }: ItemTileMappingProps) {
    const mapping = getItemTileMapping();
    const userIndices = getAvailableUserIndices();

    return (
        <div className="item-tile-mapping">
            <h3>Item Tile Mapping</h3>
            <p>Use these numbers (1-18) when placing items:</p>

            {showDetails ? (
                <table className="mapping-table">
                    <thead>
                        <tr>
                            <th>User Index</th>
                            <th>Tile Frame ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userIndices.map((index) => (
                            <tr key={index}>
                                <td>{index}</td>
                                <td>{mapping[index]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="user-indices">
                    {userIndices.map((index) => (
                        <span key={index} className="user-index">
                            {index}
                        </span>
                    ))}
                </div>
            )}

            <style jsx>{`
                .item-tile-mapping {
                    background: rgba(0, 0, 0, 0.7);
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 16px;
                    color: white;
                    max-width: 500px;
                }

                h3 {
                    margin-top: 0;
                    margin-bottom: 8px;
                }

                .mapping-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 12px;
                }

                .mapping-table th,
                .mapping-table td {
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 6px 12px;
                    text-align: center;
                }

                .user-indices {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }

                .user-index {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}

