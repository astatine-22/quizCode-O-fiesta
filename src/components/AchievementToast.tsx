import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Achievement } from '../store/achievementStore';
import './AchievementToast.css';

interface AchievementToastProps {
    achievement: Achievement | null;
    onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (achievement) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onDismiss, 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onDismiss]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="achievement-toast"
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <div className="achievement-glow" />
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-content">
                        <div className="achievement-label">Achievement Unlocked!</div>
                        <div className="achievement-name">{achievement.name}</div>
                        <div className="achievement-description">{achievement.description}</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
