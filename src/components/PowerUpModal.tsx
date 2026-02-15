import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePowerUpStore, type PowerUpType } from '../store/powerUpStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useTeamStore } from '../store/teamStore';
import { stealPointsFromTeam, sendNotification, applyPowerUpEffect, drainLifeFromTeam } from '../utils/firebaseSync';
import { useGameStore } from '../store/gameStore';
import './PowerUpModal.css';

interface PowerUpModalProps {
    type: PowerUpType;
    onClose: () => void;
}

export const PowerUpModal: React.FC<PowerUpModalProps> = ({ type, onClose }) => {
    const { powerUps, usePowerUp, addActiveEffect } = usePowerUpStore();
    const { entries } = useLeaderboardStore();
    const { isTeamMode, myTeam, opponentTeam, gameSessionId } = useTeamStore();
    const { isDemoMode } = useGameStore();
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
        const success = usePowerUp(type, selectedTargetId ?? undefined);

        if (success) {
            // Team mode: Apply power-up to opponent team via Firebase
            if (isTeamMode && gameSessionId && myTeam && opponentTeam) {
                const mode = isDemoMode ? 'admin' : 'user';

                if (type === 'pointSteal') {
                    // Steal 15% of opponent's points
                    const stolenPoints = await stealPointsFromTeam(
                        gameSessionId,
                        myTeam,
                        opponentTeam,
                        0.15,
                        mode
                    );
                    console.log(`[PowerUp] Stole ${stolenPoints} points from ${opponentTeam}`);
                } else if (type === 'freeze') {
                    // Apply freeze effect to opponent
                    await applyPowerUpEffect(gameSessionId, opponentTeam, 'freeze', mode);
                    await sendNotification(gameSessionId, {
                        type: 'freeze',
                        team: myTeam,
                        message: `❄️ ${myTeam} froze ${opponentTeam}'s combo multiplier!`
                    }, mode);
                } else if (type === 'scramble') {
                    // Apply scramble effect to opponent
                    await applyPowerUpEffect(gameSessionId, opponentTeam, 'scramble', mode);
                    await sendNotification(gameSessionId, {
                        type: 'scramble',
                        team: myTeam,
                        message: `🌪️ ${myTeam} scrambled ${opponentTeam}'s answers!`
                    }, mode);
                } else if (type === 'lifeDrain') {
                    // Drain a life from opponent
                    await drainLifeFromTeam(gameSessionId, opponentTeam, mode);
                    await sendNotification(gameSessionId, {
                        type: 'lifeDrain',
                        team: myTeam,
                        message: `💀 ${myTeam} drained a life from ${opponentTeam}!`
                    }, mode);
                }
            } else {
                // Solo mode: Apply local effects
                if (type !== 'pointSteal' && type !== 'lifeDrain') {
                    addActiveEffect({
                        type,
                        targetId: selectedTargetId ?? undefined,
                        duration: 2,
                        appliedAt: Date.now()
                    });
                } else {
                    console.log(`Applied instant effect ${type} to ${selectedTargetId}`);
                }
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
