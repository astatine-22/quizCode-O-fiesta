import { useState, useEffect, useRef } from 'react';
import { motion, type Variants, useAnimation } from 'framer-motion';
import { CoinFlip } from './animations/CoinFlip';
import { RouletteWheel } from './animations/RouletteWheel';
import { CardShuffle } from './animations/CardShuffle';
import { rollDoubleOrNothing, rollTripleTrouble, rollAllIn, type GambleResult } from '../utils/probabilityEngine';
import { ConfettiSystem } from '../utils/confettiSystem';
import './GambleArena.css';

interface GambleArenaProps {
    currentPoints: number;
    streakLevel: number;
    onBank: () => void;
    onGamble: (type: 'double' | 'triple' | 'allin', result: boolean, newPoints: number) => void;
}

type AnimationPhase = 'idle' | 'countdown' | 'animating' | 'revealing' | 'complete';
type GambleType = 'double' | 'triple' | 'allin' | null;

// Framer Motion variants
const containerVariants: Variants = {
    idle: {
        scale: 1,
        transition: { duration: 0.3 }
    },
    bankSelected: {
        x: '-50%',
        scale: 2,
        transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    riskSelected: {
        x: '50%',
        scale: 2,
        transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
};

const sideVariants: Variants = {
    idle: {
        scale: [1, 1.02, 1],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    },
    decisionPending: {
        scale: [1, 1.08, 1],
        transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
    }
};

export const GambleArena: React.FC<GambleArenaProps> = ({
    currentPoints,
    onBank,
    onGamble
}) => {
    const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
    const [selectedGambleType, setSelectedGambleType] = useState<GambleType>(null);
    const [countdownTimer, setCountdownTimer] = useState(10);
    const [gambleResult, setGambleResult] = useState<GambleResult | null>(null);
    const [showGambleOptions, setShowGambleOptions] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const confettiRef = useRef<ConfettiSystem | null>(null);
    const shakeControls = useAnimation();

    // Initialize confetti system
    useEffect(() => {
        if (canvasRef.current && !confettiRef.current) {
            confettiRef.current = new ConfettiSystem(canvasRef.current);
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (animationPhase === 'countdown' && countdownTimer > 0) {
            const timer = setTimeout(() => {
                setCountdownTimer(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdownTimer === 0) {
            // Auto-bank if time runs out
            handleBank();
        }
    }, [animationPhase, countdownTimer]);

    const handleBank = () => {
        setAnimationPhase('complete');
        setTimeout(() => {
            onBank();
            resetArena();
        }, 1000);
    };

    const handleRiskClick = () => {
        setShowGambleOptions(true);
        setAnimationPhase('countdown');
    };

    const handleGambleSelect = (type: GambleType) => {
        if (!type) return;

        setSelectedGambleType(type);
        setShowGambleOptions(false);
        setAnimationPhase('animating');

        // Roll the dice
        let result: GambleResult;
        switch (type) {
            case 'double':
                result = rollDoubleOrNothing();
                break;
            case 'triple':
                result = rollTripleTrouble();
                break;
            case 'allin':
                result = rollAllIn();
                break;
        }

        setGambleResult(result);
    };

    const handleAnimationComplete = () => {
        setAnimationPhase('revealing');

        if (gambleResult?.won) {
            // Trigger confetti
            if (confettiRef.current && canvasRef.current) {
                const centerX = canvasRef.current.width / 2;
                const centerY = canvasRef.current.height / 2;
                confettiRef.current.explode(centerX, centerY, 100);
                confettiRef.current.start();
            }
        } else {
            // Trigger screen shake on loss
            shakeControls.start({
                x: [0, -8, 8, -4, 4, 0],
                transition: { duration: 0.4 }
            });
        }

        // Calculate new points with enhanced multipliers
        const multiplier = selectedGambleType === 'double' ? 2 : selectedGambleType === 'triple' ? 4 : 6;
        const newPoints = gambleResult?.won ? currentPoints * multiplier : 0;

        setTimeout(() => {
            setAnimationPhase('complete');
            setTimeout(() => {
                onGamble(selectedGambleType!, gambleResult!.won, newPoints);
                resetArena();
            }, 1500);
        }, 1500);
    };

    const resetArena = () => {
        setAnimationPhase('idle');
        setSelectedGambleType(null);
        setCountdownTimer(10);
        setGambleResult(null);
        setShowGambleOptions(false);
        if (confettiRef.current) {
            confettiRef.current.clear();
        }
    };

    return (
        <motion.div className="gamble-arena" animate={shakeControls}>
            <canvas ref={canvasRef} className="confetti-canvas" />

            {animationPhase === 'animating' && selectedGambleType && gambleResult && (
                <div className="animation-overlay">
                    {selectedGambleType === 'double' && (
                        <CoinFlip result={gambleResult.won} onComplete={handleAnimationComplete} />
                    )}
                    {selectedGambleType === 'triple' && (
                        <RouletteWheel result={gambleResult.won} onComplete={handleAnimationComplete} />
                    )}
                    {selectedGambleType === 'allin' && (
                        <CardShuffle result={gambleResult.won} onComplete={handleAnimationComplete} />
                    )}
                </div>
            )}

            {(animationPhase === 'idle' || animationPhase === 'countdown') && (
                <motion.div
                    className="split-screen"
                    variants={containerVariants}
                    animate={animationPhase === 'idle' ? 'idle' : 'idle'}
                >
                    {/* BANK IT - Left Side */}
                    <motion.div
                        className="side bank-side"
                        variants={sideVariants}
                        animate="idle"
                        onClick={handleBank}
                    >
                        <div className="side-content">
                            <div className="side-icon">🏦</div>
                            <div className="side-title">BANK IT</div>
                            <div className="side-subtitle">Keep your {currentPoints} points safe</div>
                            <div className="side-description">Play it safe and secure your streak!</div>
                        </div>
                    </motion.div>

                    {/* RISK IT - Right Side */}
                    <motion.div
                        className="side risk-side"
                        variants={sideVariants}
                        animate={animationPhase === 'countdown' ? 'decisionPending' : 'idle'}
                        onClick={handleRiskClick}
                        whileHover={{
                            scale: 1.1,
                            boxShadow: '0 0 30px #ff006e',
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 10,
                        }}
                    >
                        <div className="side-content">
                            <div className="side-icon">🎲</div>
                            <div className="side-title">RISK IT</div>
                            <div className="side-subtitle">Gamble for more!</div>
                            {animationPhase === 'countdown' && (
                                <div className="countdown-timer">{countdownTimer}s</div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {showGambleOptions && (
                <>
                    {/* Dark overlay */}
                    <div className="gamble-overlay" onClick={() => setShowGambleOptions(false)} />

                    <motion.div
                        className="gamble-options"
                        initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <h2>Choose Your Gamble</h2>
                        <div className="options-grid">
                            <button
                                className="gamble-option double-option"
                                onClick={() => handleGambleSelect('double')}
                            >
                                <div className="option-icon">🪙</div>
                                <div className="option-title">Double or Nothing</div>
                                <div className="option-chance">50% chance</div>
                                <div className="option-reward">2x points</div>
                            </button>

                            <button
                                className="gamble-option triple-option"
                                onClick={() => handleGambleSelect('triple')}
                            >
                                <div className="option-icon">🎡</div>
                                <div className="option-title">Triple Trouble</div>
                                <div className="option-chance">33% chance</div>
                                <div className="option-reward">4x points</div>
                            </button>

                            <button
                                className="gamble-option allin-option"
                                onClick={() => handleGambleSelect('allin')}
                            >
                                <div className="option-icon">🃏</div>
                                <div className="option-title">All In</div>
                                <div className="option-chance">45% chance</div>
                                <div className="option-reward">6x points</div>
                                <div className="option-badge">HIGH RISK!</div>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};
