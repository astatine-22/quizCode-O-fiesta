import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import './CardShuffle.css';

interface CardShuffleProps {
    result: boolean; // true = win, false = lose
    onComplete: () => void;
}

type AnimationPhase = 'shuffle' | 'deal' | 'reveal' | 'complete';

export const CardShuffle: React.FC<CardShuffleProps> = ({ result, onComplete }) => {
    const [phase, setPhase] = useState<AnimationPhase>('shuffle');

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase('deal'), 1000),      // Shuffle for 1s
            setTimeout(() => setPhase('reveal'), 2500),    // Deal for 1.5s
            setTimeout(() => setPhase('complete'), 3500),  // Reveal for 1s
            setTimeout(() => onComplete(), 4000),          // Complete after 4s
        ];

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="card-shuffle-container">
            <AnimatePresence mode="wait">
                {phase === 'shuffle' && (
                    <motion.div
                        key="shuffle"
                        className="shuffle-phase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="card-stack">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="card card-back"
                                    animate={{
                                        x: [0, -30, 30, 0],
                                        y: [0, -20, 20, 0],
                                        rotate: [0, -10, 10, 0],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                    }}
                                >
                                    <div className="card-pattern">🎴</div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="phase-text">SHUFFLING...</div>
                    </motion.div>
                )}

                {phase === 'deal' && (
                    <motion.div
                        key="deal"
                        className="deal-phase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="card-spread">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="card card-back"
                                    initial={{ x: 0, y: 0, rotate: 0 }}
                                    animate={{
                                        x: (i - 1) * 120,
                                        y: 0,
                                        rotate: (i - 1) * 5,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.2,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                >
                                    <div className="card-pattern">🎴</div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="phase-text">DEALING...</div>
                    </motion.div>
                )}

                {(phase === 'reveal' || phase === 'complete') && (
                    <motion.div
                        key="reveal"
                        className="reveal-phase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className={`card card-front ${result ? 'card-win' : 'card-lose'}`}
                            initial={{ rotateY: 180 }}
                            animate={{ rotateY: 0 }}
                            transition={{ duration: 0.6, type: 'spring' }}
                        >
                            <div className="card-content">
                                {result ? (
                                    <>
                                        <div className="card-symbol">🏆</div>
                                        <div className="card-label">JACKPOT!</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="card-symbol">💥</div>
                                        <div className="card-label">BUSTED!</div>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {phase === 'complete' && (
                            <motion.div
                                className={`result-overlay ${result ? 'win' : 'lose'}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {result ? (
                                    <div className="result-message win-message">
                                        🎰 JACKPOT! 🎰
                                    </div>
                                ) : (
                                    <div className="result-message lose-message">
                                        <motion.div
                                            animate={{
                                                rotate: [0, -5, 5, -5, 5, 0],
                                            }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            💀 BUSTED 💀
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
