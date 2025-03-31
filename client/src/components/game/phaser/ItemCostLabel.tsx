"use client";

interface ItemCostLabelProps {
    compact?: boolean;
}

export function ItemCostLabel({ compact = false }: ItemCostLabelProps) {
    return (
        <div className="item-cost-label">
            {compact ? (
                <span>Cost: 0.1 STT</span>
            ) : (
                <div className="cost-details">
                    <h4>Place Item Cost</h4>
                    <p>
                        Each item costs <strong>0.1 STT</strong> to place
                    </p>
                </div>
            )}

            <style jsx>{`
                .item-cost-label {
                    background: rgba(0, 0, 0, 0.7);
                    border-radius: 8px;
                    padding: ${compact ? "8px 12px" : "16px"};
                    margin-top: ${compact ? "8px" : "16px"};
                    color: white;
                    ${compact ? "display: inline-block;" : ""}
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                h4 {
                    margin-top: 0;
                    margin-bottom: 8px;
                    color: #ffd700;
                }

                p {
                    margin: 0;
                }

                strong {
                    color: #ffd700;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}

