import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useGameStore } from '../store/gameStore';
import { useDuelStore } from '../store/duelStore';
import './Leaderboard.css';

export const Leaderboard: React.FC = () => {
    const { entries, adminEntries, loadLeaderboard } = useLeaderboardStore();
    const { isDemoMode } = useGameStore();
    const { canChallenge, startDuelSelection, selectOpponent } = useDuelStore();

    // Ensure leaderboard is loaded on mount
    useEffect(() => {
        loadLeaderboard();
    }, [loadLeaderboard]);

    const displayEntries = isDemoMode ? adminEntries : entries;

    if (displayEntries.length === 0) {
        return (
            <div className="leaderboard-empty">
                <div className="empty-icon">🏆</div>
                <div className="empty-text">
                    {isDemoMode ? 'No Admin Scores yet.' : 'No scores yet. Be the first!'}
                </div>
            </div>
        );
    }

    const getMedalIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    const handleChallenge = (entry: any) => {
        if (startDuelSelection()) {
            selectOpponent(entry);
        }
    };

    return (
        <div className="leaderboard">
            <h3 className="leaderboard-title">
                {isDemoMode ? '⚡ Admin Leaderboard' : '🏆 Top Players'}
            </h3>
            <div className="leaderboard-list">
                {displayEntries.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        className={`leaderboard-entry ${index < 3 ? 'top-three' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="entry-rank">{getMedalIcon(index)}</div>
                        <div className="entry-details">
                            <div className="entry-name">{entry.playerName}</div>
                            <div className="entry-stats">
                                {entry.score.toLocaleString()} pts • {entry.maxStreak} streak
                            </div>
                        </div>
                        {canChallenge() && index < 5 && !isDemoMode && (
                            <button
                                className="duel-challenge-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleChallenge(entry);
                                }}
                            >
                                ⚔️ VS
                            </button>
                        )}
                        <div className="entry-date">
                            {new Date(entry.date).toLocaleDateString()}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
