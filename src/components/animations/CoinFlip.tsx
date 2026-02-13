import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './CoinFlip.css';

interface CoinFlipProps {
    result: boolean; // true = heads (win), false = tails (lose)
    onComplete: () => void;
}

export const CoinFlip: React.FC<CoinFlipProps> = ({ result, onComplete }) => {
    const [isFlipping, setIsFlipping] = useState(true);

    useEffect(() => {
        // Complete after 2s animation
        const timer = setTimeout(() => {
            setIsFlipping(false);
            onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    // Determine final rotation (heads = 0deg, tails = 180deg)
    const finalRotation = result ? 0 : 180;

    return (
        <div className="coin-flip-container">
            <motion.div
                className="coin"
                initial={{ rotateY: 0 }}
                animate={{
                    rotateY: isFlipping ? [0, 1800 + finalRotation] : finalRotation,
                }}
                transition={{
                    duration: 2,
                    ease: [0.45, 0, 0.55, 1], // Custom easing for realistic flip
                }}
            >
                <div className="coin-face coin-heads">
                    <div className="coin-symbol">👑</div>
                    <div className="coin-text">HEADS</div>
                </div>
                <div className="coin-face coin-tails">
                    <div className="coin-symbol">💀</div>
                    <div className="coin-text">TAILS</div>
                </div>
            </motion.div>

            {!isFlipping && (
                <motion.div
                    className={`result-text ${result ? 'win' : 'lose'}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {result ? '🎉 YOU WIN! 🎉' : '💀 YOU LOSE 💀'}
                </motion.div>
            )}
        </div>
    );
};
