import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import './ComboDisplay.css';

interface ComboDisplayProps {
    comboCount: number;
    multiplier: number;
}

export const ComboDisplay: React.FC<ComboDisplayProps> = ({ comboCount, multiplier }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(comboCount >= 2);
    }, [comboCount]);

    if (!show) return null;

    const getComboText = () => {
        if (comboCount >= 5) return 'MEGA COMBO!';
        if (comboCount >= 3) return 'SUPER COMBO!';
        return 'COMBO!';
    };

    const getComboColor = () => {
        if (comboCount >= 5) return '#b026ff'; // Purple
        if (comboCount >= 3) return '#ff0000'; // Red
        return '#ffaa00'; // Orange
    };

    return (
        <AnimatePresence>
            <motion.div
                className="combo-display"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
                <motion.div
                    className="combo-multiplier"
                    style={{ color: getComboColor() }}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 0.5
                    }}
                >
                    {multiplier}x
                </motion.div>
                <motion.div
                    className="combo-text"
                    style={{ color: getComboColor() }}
                >
                    {getComboText()}
                </motion.div>
                <div className="combo-count">{comboCount} in a row!</div>
            </motion.div>
        </AnimatePresence>
    );
};
