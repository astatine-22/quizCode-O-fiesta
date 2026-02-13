import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePowerUpStore } from '../store/powerUpStore';
import './ActiveEffects.css';

export const ActiveEffects: React.FC = () => {
    const { activeEffects, powerUps } = usePowerUpStore();

    if (activeEffects.length === 0) return null;

    return (
        <div className="active-effects-container">
            <AnimatePresence>
                {activeEffects.map((effect) => (
                    <motion.div
                        key={`${effect.type}-${effect.appliedAt}`}
                        className={`active-effect-item effect-${effect.type}`}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                    >
                        <span className="effect-icon">{powerUps[effect.type].icon}</span>
                        <div className="effect-info">
                            <span className="effect-name">{powerUps[effect.type].name}</span>
                            <span className="effect-timer">{effect.duration} Turns Remaining</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
