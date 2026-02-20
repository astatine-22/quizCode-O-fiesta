import { motion } from 'framer-motion';
import { useTeamStore } from '../store/teamStore';
import './OpponentStatus.css';

export const OpponentStatus: React.FC = () => {
    const { opponentTeam, opponentTeamData } = useTeamStore();

    if (!opponentTeam || !opponentTeamData) return null;

    const getTeamColor = (team: string) => {
        if (team === 'FY_BSc') return '#FFD700';
        if (team === 'SY_BSc') return '#FF6347';
        if (team === 'Admin1') return '#00ff88';
        if (team === 'Admin2') return '#00b8ff';
        return '#888';
    };

    const isOnStreak = opponentTeamData.streak >= 3;

    return (
        <motion.div
            className={`opponent-status ${isOnStreak ? 'on-streak' : ''}`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ borderColor: getTeamColor(opponentTeam) }}
        >
            <div className="opponent-header">
                <div className="opponent-label">OPPONENT</div>
                <div className="opponent-name" style={{ color: getTeamColor(opponentTeam) }}>
                    {opponentTeam}
                </div>
            </div>

            <div className="opponent-stats">

                <div className="stat-row">
                    <span className="stat-label">Streak:</span>
                    <span className="stat-value streak">
                        {opponentTeamData.streak > 0 && '🔥'} {opponentTeamData.streak}
                    </span>
                </div>

                <div className="stat-row">
                    <span className="stat-label">Lives:</span>
                    <span className="stat-value">
                        {'❤️'.repeat(opponentTeamData.lives)}
                    </span>
                </div>
            </div>


            {isOnStreak && (
                <motion.div
                    className="streak-warning"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    ⚠️ ON FIRE!
                </motion.div>
            )}
        </motion.div>
    );
};
