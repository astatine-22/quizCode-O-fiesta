import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './ScoreCounter.css';

interface ScoreCounterProps {
    score: number;
    streak: number;
    lives: number;
}

export const ScoreCounter: React.FC<ScoreCounterProps> = ({ score, streak, lives }) => {
    const [displayScore, setDisplayScore] = useState(score);
    const [prevScore, setPrevScore] = useState(score);

    // Animate score changes
    useEffect(() => {
        if (score === displayScore) return;

        const diff = score - displayScore;
        const increment = Math.ceil(Math.abs(diff) / 10);
        const direction = diff > 0 ? 1 : -1;

        const timer = setInterval(() => {
            setDisplayScore(prev => {
                const next = prev + (increment * direction);
                if ((direction > 0 && next >= score) || (direction < 0 && next <= score)) {
                    clearInterval(timer);
                    return score;
                }
                return next;
            });
        }, 30);

        setPrevScore(displayScore);
        return () => clearInterval(timer);
    }, [score]);

    const scoreDiff = score - prevScore;
    const isLargeIncrease = scoreDiff > 500;

    return (
        <div className="score-counter-container">
            <div className="score-section">
                <div className="score-label">Score</div>
                <motion.div
                    className="score-value"
                    animate={isLargeIncrease ? {
                        scale: [1, 1.2, 1],
                        color: ['#FFD700', '#FFA500', '#FFD700']
                    } : {}}
                    transition={{ duration: 0.5 }}
                >
                    {displayScore.toLocaleString()}
                </motion.div>
            </div>

            <div className="stats-section">
                <div className="stat-item">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{streak}</div>
                    <div className="stat-label">Streak</div>
                </div>

                <div className="stat-item">
                    <div className="stat-icon">❤️</div>
                    <div className="stat-value">{lives}</div>
                    <div className="stat-label">Lives</div>
                </div>
            </div>

            {streak >= 5 && (
                <motion.div
                    className="streak-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                    🔥 ON FIRE! 🔥
                </motion.div>
            )}
        </div>
    );
};
