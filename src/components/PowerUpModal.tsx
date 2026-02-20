import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePowerUpStore, type PowerUpType } from '../store/powerUpStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useTeamStore } from '../store/teamStore';
import './PowerUpModal.css';

interface PowerUpModalProps {
    type: PowerUpType;
    onClose: () => void;
}

export const PowerUpModal: React.FC<PowerUpModalProps> = ({ type, onClose }) => {
    const { powerUps, usePowerUp, addActiveEffect } = usePowerUpStore();
    const { entries } = useLeaderboardStore();
    const { isTeamMode, opponentTeam } = useTeamStore();
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

    const powerUp = powerUps[type];

    // In team mode, target is the opponent team
    // In solo mode, target is top 5 players
    const potentialTargets = isTeamMode
        ? [{ id: opponentTeam || 'opponent', playerName: opponentTeam || 'Opponent Team', score: 0 }]
        : entries.slice(0, 5);

    // Auto-select opponent team in team mode
    useEffect(() => {
        if (isTeamMode && opponentTeam) {
            setSelectedTargetId(opponentTeam);
        }
    }, [isTeamMode, opponentTeam]);

    const handleConfirm = async () => {
        console.log('[PowerUpModal] handleConfirm called');
        console.log('[PowerUpModal] Type:', type);
        console.log('[PowerUpModal] Selected Target:', selectedTargetId);
        console.log('[PowerUpModal] Team Mode:', isTeamMode);

        // Use the power-up (now handles Firebase sync internally)
        const success = await usePowerUp(type, selectedTargetId ?? undefined);
        console.log('[PowerUpModal] usePowerUp success:', success);

        if (success) {
            // In solo mode, add local effects for non-instant power-ups
            if (!isTeamMode && type !== 'pointSteal' && type !== 'lifeDrain') {
                addActiveEffect({
                    type,
                    targetId: selectedTargetId ?? undefined,
                    duration: 2,
                    appliedAt: Date.now()
                });
                console.log(`[PowerUpModal] Applied local effect ${type}`);
            }

            console.log('[PowerUpModal] Closing modal');
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
                    <p className="modal-description">
                        {isTeamMode
                            ? `Attack the opponent team with ${powerUp.name}!`
                            : powerUp.description}
                    </p>
                </div>

                <div className="target-selection">
                    <label className="target-label">
                        {isTeamMode ? 'Target Team:' : 'Select Target:'}
                    </label>
                    <div className="target-list">
                        {potentialTargets.map((entry, index) => (
                            <div
                                key={entry.id}
                                className={`target-item ${selectedTargetId === entry.id ? 'selected' : ''}`}
                                onClick={() => setSelectedTargetId(entry.id)}
                            >
                                {!isTeamMode && <span className="target-rank">#{index + 1}</span>}
                                <span className="target-name">{entry.playerName}</span>
                                {!isTeamMode && <span className="target-score">{entry.score.toLocaleString()}</span>}
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
                        style={{ background: selectedTargetId ? powerUp.color : '#666' }}
                    >
                        Use Power-Up
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
