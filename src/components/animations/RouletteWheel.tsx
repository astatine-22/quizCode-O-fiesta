import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import './RouletteWheel.css';

interface RouletteWheelProps {
    result: boolean; // true = win, false = lose
    onComplete: () => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({ result, onComplete }) => {
    const [isSpinning, setIsSpinning] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Complete after 3s animation
        const timer = setTimeout(() => {
            setIsSpinning(false);
            onComplete();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 120;

        // Draw wheel with 3 segments
        const segments = [
            { color: '#00ff00', label: 'WIN', angle: 0 },
            { color: '#ff0000', label: 'LOSE', angle: 120 },
            { color: '#ff0000', label: 'LOSE', angle: 240 },
        ];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        segments.forEach((segment, i) => {
            const startAngle = (segment.angle * Math.PI) / 180;
            const endAngle = ((segment.angle + 120) * Math.PI) / 180;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw label
            const labelAngle = startAngle + (Math.PI / 3);
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.6);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.6);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(segment.label, labelX, labelY);
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }, []);

    // Calculate final rotation (win = 0-120deg, lose = 120-360deg)
    const finalRotation = result ? 60 : 180; // Land on WIN or LOSE segment
    const totalRotation = 1440 + finalRotation; // 4 full spins + final position

    return (
        <div className="roulette-container">
            <div className="roulette-pointer">▼</div>

            <motion.div
                className="roulette-wheel"
                initial={{ rotate: 0 }}
                animate={{
                    rotate: isSpinning ? totalRotation : totalRotation,
                }}
                transition={{
                    duration: 3,
                    ease: [0.25, 0.1, 0.25, 1], // Deceleration easing
                }}
            >
                <canvas ref={canvasRef} width={300} height={300} />
            </motion.div>

            {!isSpinning && (
                <motion.div
                    className={`result-text ${result ? 'win' : 'lose'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {result ? '🎊 WINNER! 🎊' : '😢 BETTER LUCK NEXT TIME'}
                </motion.div>
            )}
        </div>
    );
};
