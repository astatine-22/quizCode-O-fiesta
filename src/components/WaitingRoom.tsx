import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamStore } from '../store/teamStore';
import { useGameStore } from '../store/gameStore';
import { checkBothTeamsReady, updateGameStatus } from '../utils/firebaseSync';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import './WaitingRoom.css';

interface WaitingRoomProps {
    onGameStart: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ onGameStart }) => {
    const { myTeam, opponentTeam, gameSessionId, myTeamData, opponentTeamData, setReady, listenToOpponent } = useTeamStore();
    const { isDemoMode } = useGameStore();

    const [isReady, setIsReady] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [bothReady, setBothReady] = useState(false);

    const mode = isDemoMode ? 'admin' : 'user';

    // Listen to opponent team
    useEffect(() => {
        if (gameSessionId) {
            listenToOpponent();
        }
    }, [gameSessionId, listenToOpponent]);

    // Check if both teams are ready
    useEffect(() => {
        if (!gameSessionId) return;

        const teamsRef = ref(database, `games/${mode}/${gameSessionId}/teams`);

        const unsubscribe = onValue(teamsRef, async (snapshot) => {
            const teams = snapshot.val();

            if (teams) {
                const teamNames = Object.keys(teams);
                const allReady = teamNames.length >= 2 && teamNames.every(name => teams[name]?.ready === true);

                setBothReady(allReady);

                if (allReady && !countdown) {
                    // Start countdown
                    await updateGameStatus(gameSessionId, 'playing', mode);
                    startCountdown();
                }
            }
        });

        return () => unsubscribe();
    }, [gameSessionId, mode, countdown]);

    const handleReady = async () => {
        setIsReady(true);
        await setReady(true);
    };

    const startCountdown = () => {
        let count = 3;
        setCountdown(count);

        const interval = setInterval(() => {
            count--;
            setCountdown(count);

            if (count === 0) {
                clearInterval(interval);
                setTimeout(() => {
                    onGameStart();
                }, 500);
            }
        }, 1000);
    };

    const getTeamColor = (team: string | null) => {
        if (!team) return '#888';
        if (team === 'FY_BSc') return '#FFD700';
        if (team === 'SY_BSc') return '#FF6347';
        if (team === 'Admin1') return '#00ff88';
        if (team === 'Admin2') return '#00b8ff';
        return '#888';
    };

    return (
        <div className="waiting-room-screen">
            <AnimatePresence>
                {countdown !== null ? (
                    <motion.div
                        className="countdown-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="countdown-number"
                            key={countdown}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            {countdown === 0 ? 'GO! 🚀' : countdown}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="waiting-room-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="waiting-room-title">⏳ Waiting Room</h1>

                        <div className="teams-status">
                            {/* My Team */}
                            <motion.div
                                className={`team-status-card ${isReady ? 'ready' : ''}`}
                                style={{ borderColor: getTeamColor(myTeam) }}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="team-status-header">
                                    <h2 style={{ color: getTeamColor(myTeam) }}>{myTeam}</h2>
                                    <div className="team-badge">YOUR TEAM</div>
                                </div>

                                <div className="team-members">
                                    {myTeamData?.members.map((member, idx) => (
                                        <div key={idx} className="member-chip">
                                            👤 {member}
                                        </div>
                                    ))}
                                </div>

                                <div className="ready-status">
                                    {isReady ? (
                                        <div className="status-ready">✅ READY</div>
                                    ) : (
                                        <button className="ready-button" onClick={handleReady}>
                                            Click When Ready
                                        </button>
                                    )}
                                </div>
                            </motion.div>

                            {/* VS Badge */}
                            <motion.div
                                className="vs-badge"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                            >
                                VS
                            </motion.div>

                            {/* Opponent Team */}
                            <motion.div
                                className={`team-status-card ${opponentTeamData?.ready ? 'ready' : ''}`}
                                style={{ borderColor: getTeamColor(opponentTeam) }}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="team-status-header">
                                    <h2 style={{ color: getTeamColor(opponentTeam) }}>{opponentTeam}</h2>
                                    <div className="team-badge opponent">OPPONENT</div>
                                </div>

                                <div className="team-members">
                                    {opponentTeamData?.members && opponentTeamData.members.length > 0 ? (
                                        opponentTeamData.members.map((member, idx) => (
                                            <div key={idx} className="member-chip">
                                                👤 {member}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="waiting-text">Waiting for players...</div>
                                    )}
                                </div>

                                <div className="ready-status">
                                    {opponentTeamData?.ready ? (
                                        <div className="status-ready">✅ READY</div>
                                    ) : (
                                        <div className="status-waiting">⏳ Waiting...</div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {bothReady && (
                            <motion.div
                                className="all-ready-message"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                🎉 Both teams ready! Starting soon...
                            </motion.div>
                        )}

                        <div className="waiting-room-info">
                            <p>💡 The game will start automatically when both teams are ready!</p>
                            <p>🔥 Get ready for an epic battle!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
