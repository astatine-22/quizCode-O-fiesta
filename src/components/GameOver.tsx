import { motion } from 'framer-motion';
import './GameOver.css';

interface GameOverProps {
    finalScore: number;
    maxStreak: number;
    questionsAnswered: number;
    correctAnswers: number;
}

export const GameOver: React.FC<GameOverProps> = ({
    finalScore,
    maxStreak,
    questionsAnswered,
    correctAnswers
}) => {
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

    return (
        <motion.div
            className="game-over-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="game-over-container"
                initial={{ scale: 0.8, rotateX: 90 }}
                animate={{ scale: 1, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <motion.div
                    className="game-over-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    GAME OVER
                </motion.div>

                <motion.div
                    className="final-score-section"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                >
                    <div className="final-score-label">Final Score</div>
                    <motion.div
                        className="final-score-value"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        {finalScore.toLocaleString()}
                    </motion.div>
                </motion.div>

                <motion.div
                    className="stats-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <motion.div
                        className="stat-card"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.0 }}
                    >
                        <div className="stat-icon">🔥</div>
                        <div className="stat-number">{maxStreak}</div>
                        <div className="stat-text">Max Streak</div>
                    </motion.div>

                    <motion.div
                        className="stat-card"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.1 }}
                    >
                        <div className="stat-icon">✓</div>
                        <div className="stat-number">{correctAnswers}/{questionsAnswered}</div>
                        <div className="stat-text">Correct</div>
                    </motion.div>

                    <motion.div
                        className="stat-card"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        <div className="stat-icon">📊</div>
                        <div className="stat-number">{accuracy}%</div>
                        <div className="stat-text">Accuracy</div>
                    </motion.div>
                </motion.div>


            </motion.div>
        </motion.div>
    );
};
