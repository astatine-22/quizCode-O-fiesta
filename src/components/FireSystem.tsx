import { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ParticleSystem } from '../utils/ParticleSystem';
import './FireSystem.css';

interface FireSystemProps {
    streakLevel: number;
    isActive: boolean;
    onIntensityChange?: (intensity: number) => void;
}

// Framer Motion variants for each intensity level
const backgroundVariants: Variants = {
    ember: {
        background: 'radial-gradient(circle at 50% 100%, rgba(30, 20, 20, 1) 0%, rgba(10, 10, 10, 1) 100%)',
        transition: { duration: 1.5, ease: 'easeInOut' }
    },
    blaze: {
        background: 'radial-gradient(circle at 50% 100%, rgba(80, 40, 20, 1) 0%, rgba(30, 15, 10, 1) 50%, rgba(10, 10, 10, 1) 100%)',
        transition: { duration: 1.5, ease: 'easeInOut' }
    },
    inferno: {
        background: 'radial-gradient(circle at 50% 100%, rgba(120, 60, 20, 1) 0%, rgba(60, 30, 15, 1) 40%, rgba(20, 10, 10, 1) 100%)',
        transition: { duration: 1.5, ease: 'easeInOut' }
    },
    hellfire: {
        background: [
            'radial-gradient(circle at 50% 100%, rgba(150, 80, 30, 1) 0%, rgba(80, 40, 20, 1) 40%, rgba(30, 15, 10, 1) 100%)',
            'radial-gradient(circle at 50% 100%, rgba(180, 100, 40, 1) 0%, rgba(100, 50, 25, 1) 40%, rgba(40, 20, 10, 1) 100%)',
            'radial-gradient(circle at 50% 100%, rgba(150, 80, 30, 1) 0%, rgba(80, 40, 20, 1) 40%, rgba(30, 15, 10, 1) 100%)'
        ],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

const edgeGlowVariants: Variants = {
    ember: {
        opacity: 0,
        boxShadow: 'inset 0 0 0px rgba(255, 200, 0, 0)',
        transition: { duration: 0.5 }
    },
    blaze: {
        opacity: 0,
        boxShadow: 'inset 0 0 0px rgba(255, 200, 0, 0)',
        transition: { duration: 0.5 }
    },
    inferno: {
        opacity: 1,
        boxShadow: [
            'inset 0 0 80px rgba(255, 200, 0, 0.4)',
            'inset 0 0 120px rgba(255, 200, 0, 0.6)',
            'inset 0 0 80px rgba(255, 200, 0, 0.4)'
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    },
    hellfire: {
        opacity: 1,
        boxShadow: [
            'inset 0 0 100px rgba(255, 220, 100, 0.6)',
            'inset 0 0 150px rgba(255, 220, 100, 0.8)',
            'inset 0 0 100px rgba(255, 220, 100, 0.6)'
        ],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

const screenShakeVariants: Variants = {
    ember: {
        x: 0,
        transition: { duration: 0.1 }
    },
    blaze: {
        x: 0,
        transition: { duration: 0.1 }
    },
    inferno: {
        x: [-2, 2, -2, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    },
    hellfire: {
        x: [-3, 3, -3, 0],
        y: [-1, 1, -1, 0],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

export const FireSystem: React.FC<FireSystemProps> = ({
    streakLevel,
    isActive,
    onIntensityChange
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particleSystemRef = useRef<ParticleSystem | null>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const [variant, setVariant] = useState<'ember' | 'blaze' | 'inferno' | 'hellfire'>('ember');

    // Determine variant based on streak level
    useEffect(() => {
        if (streakLevel <= 3) {
            setVariant('ember');
        } else if (streakLevel <= 6) {
            setVariant('blaze');
        } else if (streakLevel <= 9) {
            setVariant('inferno');
        } else {
            setVariant('hellfire');
        }
    }, [streakLevel]);

    // Initialize particle system
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        particleSystemRef.current = new ParticleSystem(canvas);

        const handleResize = () => {
            particleSystemRef.current?.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Update particle system state
    useEffect(() => {
        if (particleSystemRef.current) {
            particleSystemRef.current.setStreakLevel(streakLevel);
            particleSystemRef.current.setActive(isActive);

            // Notify parent of intensity change for audio bridge
            const intensity = particleSystemRef.current.getIntensity();
            onIntensityChange?.(intensity);
        }
    }, [streakLevel, isActive, onIntensityChange]);

    // Animation loop
    useEffect(() => {
        const animate = () => {
            if (particleSystemRef.current) {
                particleSystemRef.current.update();
                particleSystemRef.current.draw();
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <motion.div
            className="fire-system"
            variants={screenShakeVariants}
            animate={variant}
        >
            <motion.div
                className="fire-background"
                variants={backgroundVariants}
                animate={variant}
            />

            <motion.div
                className="fire-edge-glow"
                variants={edgeGlowVariants}
                animate={variant}
            />

            <canvas
                ref={canvasRef}
                className="fire-canvas"
            />

            {variant === 'hellfire' && (
                <motion.div
                    className="hellfire-overlay"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            )}
        </motion.div>
    );
};
