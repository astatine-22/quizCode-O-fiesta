import { motion } from 'framer-motion';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useDuelStore } from '../store/duelStore';
import './Leaderboard.css';

export const Leaderboard: React.FC = () => {
    const { entries } = useLeaderboardStore();
    const { canChallenge, startDuelSelection, selectOpponent } = useDuelStore();

    if (entries.length === 0) {
        return (
            <div className="leaderboard-empty">
                <div className="empty-icon">🏆</div>
                <div className="empty-text">No scores yet. Be the first!</div>
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
            <h3 className="leaderboard-title">🏆 Top Players</h3>
            <div className="leaderboard-list">
                {entries.map((entry, index) => (
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
                        {canChallenge() && index < 5 && (
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
