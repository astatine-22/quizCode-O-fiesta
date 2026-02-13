import React, { useEffect } from 'react';
import { usePowerUpStore, type PowerUpType } from '../store/powerUpStore';
import './AttackAnimation.css';

interface AttackAnimationProps {
    type: PowerUpType | null;
    onComplete: () => void;
}

export const AttackAnimation: React.FC<AttackAnimationProps> = ({ type, onComplete }) => {
    const { powerUps } = usePowerUpStore();

    useEffect(() => {
        if (type) {
            // Trigger haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }

            // Add shake effect to body
            document.body.classList.add('shake-hard');

            const timer = setTimeout(() => {
                document.body.classList.remove('shake-hard');
                onComplete();
            }, 1500);

            return () => {
                clearTimeout(timer);
                document.body.classList.remove('shake-hard');
            };
        }
    }, [type, onComplete]);

    if (!type) return null;

    const powerUp = powerUps[type];

    return (
        <div className={`attack-overlay attack-${type}`}>
            <div className="attack-icon">{powerUp.icon}</div>
            <div className="attack-text">{powerUp.name}!</div>
        </div>
    );
};
