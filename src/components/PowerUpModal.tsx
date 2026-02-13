import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePowerUpStore, type PowerUpType } from '../store/powerUpStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import './PowerUpModal.css';

interface PowerUpModalProps {
    type: PowerUpType;
    onClose: () => void;
}

export const PowerUpModal: React.FC<PowerUpModalProps> = ({ type, onClose }) => {
    const { powerUps, usePowerUp, addActiveEffect } = usePowerUpStore();
    const { entries } = useLeaderboardStore();
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

    const powerUp = powerUps[type];

    // Sort entries by score for target selection
    const potentialTargets = entries.slice(0, 5); // Top 5 players are targets

    const handleConfirm = () => {
        const success = usePowerUp(type, selectedTargetId ?? undefined);

        if (success) {
            // Apply visual effect
            if (type !== 'pointSteal' && type !== 'lifeDrain') {
                // For non-instant effects, add to active effects
                addActiveEffect({
                    type,
                    targetId: selectedTargetId ?? undefined,
                    duration: 2, // Default duration
                    appliedAt: Date.now()
                });
            } else {
                // For instant effects like point steal/life drain
                // In a real backend, we'd send this to server
                // For local demo, we just simulate success
                console.log(`Applied instant effect ${type} to ${selectedTargetId}`);
            }
            onClose();
        }
    };

    return (
        <div className="power-up-overlay">
            <motion.div
                className="power-up-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
            >
                <div className="modal-header">
                    <span className="modal-icon">{powerUp.icon}</span>
                    <h2 className="modal-title">{powerUp.name}</h2>
                    <p className="modal-description">{powerUp.description}</p>
                </div>

                <div className="target-selection">
                    <label className="target-label">Select Target:</label>
                    <div className="target-list">
                        {potentialTargets.map((entry, index) => (
                            <div
                                key={entry.id}
                                className={`target-item ${selectedTargetId === entry.id ? 'selected' : ''}`}
                                onClick={() => setSelectedTargetId(entry.id)}
                            >
                                <span className="target-rank">#{index + 1}</span>
                                <span className="target-name">{entry.playerName}</span>
                                <span className="target-score">{entry.score.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-confirm"
                        onClick={handleConfirm}
                        disabled={!selectedTargetId}
                    >
                        Activate Chain
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
