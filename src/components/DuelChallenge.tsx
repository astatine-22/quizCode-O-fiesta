import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDuelStore } from '../store/duelStore';
import { useGameStore } from '../store/gameStore';
import './DuelChallenge.css';

export const DuelChallenge: React.FC = () => {
    const { duelState, opponent, startDuel } = useDuelStore();
    const { setGamePhase } = useGameStore();
    const [countdown, setCountdown] = useState<number | null>(null);

    // Only show when opponent is selected but duel hasn't started active phase
    if (duelState !== 'selecting' || !opponent) return null;

    const handleConfirmDuel = () => {
        // Start 3-2-1 countdown
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev === 1) {
                    clearInterval(timer);
                    startDuel();
                    setGamePhase('duel');
                    return null;
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);
    };

    return (
        <div className="duel-overlay">
            <motion.div
                className="duel-intro"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <h2>CHALLENGE ACCEPTED!</h2>

                <div className="duel-matchup">
                    <div className="player-side">YOU</div>
                    <div className="duel-vs">VS</div>
                    <div className="opponent-side">{opponent.name}</div>
                </div>

                {!countdown ? (
                    <motion.button
                        className="start-duel-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleConfirmDuel}
                        style={{
                            marginTop: '30px',
                            padding: '15px 40px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            background: '#FF4500',
                            border: 'none',
                            borderRadius: '50px',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
                        }}
                    >
                        FIGHT!
                    </motion.button>
                ) : (
                    <motion.div
                        className="duel-countdown"
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{ fontSize: '120px', fontWeight: 'bold', color: '#FFD700' }}
                    >
                        {countdown}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
