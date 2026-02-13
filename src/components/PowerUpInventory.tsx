import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePowerUpStore, type PowerUpType } from '../store/powerUpStore';
import { PowerUpModal } from './PowerUpModal';
import './PowerUpInventory.css';

export const PowerUpInventory: React.FC = () => {
    const { inventory, powerUps, lastEarnedPowerUp, clearLastEarned } = usePowerUpStore();
    const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUpType | null>(null);

    // Filter power-ups that have count > 0
    const availablePowerUps = (Object.keys(inventory) as PowerUpType[]).filter(
        type => inventory[type] > 0
    );

    const handlePowerUpClick = (type: PowerUpType) => {
        setSelectedPowerUp(type);
    };

    const handleCloseModal = () => {
        setSelectedPowerUp(null);
    };

    if (availablePowerUps.length === 0) return null;

    return (
        <>
            <motion.div
                className="power-up-inventory"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <AnimatePresence>
                    {availablePowerUps.map((type) => (
                        <motion.div
                            key={type}
                            className={`power-up-item ${lastEarnedPowerUp === type ? 'pulse-animation' : ''}`}
                            onClick={() => handlePowerUpClick(type)}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            whileHover={{ scale: 1.1 }}
                            onAnimationComplete={() => {
                                if (lastEarnedPowerUp === type) clearLastEarned();
                            }}
                        >
                            <div className="power-up-icon">{powerUps[type].icon}</div>
                            <div className="power-up-count">{inventory[type]}</div>
                            <div className="power-up-tooltip">
                                <strong>{powerUps[type].name}</strong><br />
                                {powerUps[type].description}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {selectedPowerUp && (
                <PowerUpModal
                    type={selectedPowerUp}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};
