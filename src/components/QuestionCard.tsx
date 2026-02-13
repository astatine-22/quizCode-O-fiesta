import { useState, useEffect, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { Question } from '../data/questions';
import { usePowerUpStore } from '../store/powerUpStore';
import { useGameStore } from '../store/gameStore';
import './QuestionCard.css';

interface QuestionCardProps {
    question: Question;
    timeLimit?: number;
    streak?: number;
    onAnswerSelected: (answerIndex: number, isCorrect: boolean, answerTime: number) => void;
}

const answerVariants: Variants = {
    idle: {
        y: 0,
        scale: 1,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    hover: {
        y: -5,
        boxShadow: '0 10px 20px rgba(176, 38, 255, 0.3)',
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    },
    correct: {
        scale: [1, 1.1, 1],
        backgroundColor: ['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.3)', 'rgba(0, 255, 136, 0.1)'],
        borderColor: ['#00ff88', '#00ff88', '#00ff88'],
        transition: { duration: 0.6 }
    },
    wrong: {
        opacity: [1, 0],
        scale: [1, 0.8],
        rotate: [0, (Math.random() - 0.5) * 20],
        filter: ['blur(0px)', 'blur(4px)'],
        transition: { duration: 0.5 }
    }
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    timeLimit: baseLimitProp,
    streak = 0,
    onAnswerSelected
}) => {
    const { hasActiveEffect } = usePowerUpStore();

    // Check for active effects
    const isPressureActive = hasActiveEffect('timePressure');
    const isScrambleActive = hasActiveEffect('scramble');

    // Dynamic time limit based on streak and effects
    const getDynamicTimeLimit = () => {
        let limit = 15;
        if (streak >= 10) limit = 8;
        else if (streak >= 7) limit = 10;
        else if (streak >= 4) limit = 12;

        // Apply time pressure effect (half time)
        if (isPressureActive) {
            limit = Math.max(3, Math.floor(limit / 2));
        }

        return limit;
    };

    const timeLimit = baseLimitProp || getDynamicTimeLimit();
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [startTime] = useState(Date.now());

    // Memoize shuffled answers if scramble is active
    const displayAnswers = useMemo(() => {
        if (isScrambleActive) {
            // Create array of objects with original index to track correctness
            const answersWithIndices = question.answers.map((text, index) => ({ text, index }));
            // Shuffle
            for (let i = answersWithIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [answersWithIndices[i], answersWithIndices[j]] = [answersWithIndices[j], answersWithIndices[i]];
            }
            return answersWithIndices;
        }
        // Return normal order
        return question.answers.map((text, index) => ({ text, index }));
    }, [question, isScrambleActive]);

    // Timer countdown
    useEffect(() => {
        if (isAnswered) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isAnswered]);

    // Handle time run out
    useEffect(() => {
        if (timeLeft === 0 && !isAnswered) {
            handleAnswer(-1, -1);
        }
    }, [timeLeft, isAnswered]);

    const handleAnswer = (displayIndex: number, originalIndex: number) => {
        if (isAnswered) return;

        const answerTime = (Date.now() - startTime) / 1000; // in seconds
        setSelectedAnswer(displayIndex);
        setIsAnswered(true);

        const isCorrect = originalIndex === question.correctIndex;

        // Delay callback to show animation
        setTimeout(() => {
            onAnswerSelected(originalIndex, isCorrect, answerTime);
        }, isCorrect ? 800 : 600);
    };

    const timePercentage = (timeLeft / timeLimit) * 100;
    const timerColor = timePercentage > 50 ? '#00ff88' : timePercentage > 25 ? '#ffaa00' : '#ff0000';

    return (
        <motion.div
            className={`question-card ${isPressureActive ? 'effect-pressure' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            {/* Timer Bar */}
            <div className="timer-container">
                <motion.div
                    className="timer-bar"
                    style={{ backgroundColor: timerColor }}
                    initial={{ width: '100%' }}
                    animate={{ width: `${timePercentage}%` }}
                    transition={{ duration: 0.3 }}
                />
                <div className="timer-text">{timeLeft}s</div>
                {(streak >= 4 || isPressureActive) && (
                    <div className="timer-pressure-badge">
                        {isPressureActive ? '⚡ CRITICAL PRESSURE' : '⚡ PRESSURE MODE'}
                    </div>
                )}
            </div>

            {/* Question */}
            <motion.div
                className="question-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {question.text}
            </motion.div>

            {/* Category Badge */}
            <div className="category-badge">
                {useGameStore.getState().isDemoMode && (
                    <span style={{
                        marginRight: '10px',
                        color: '#00ff88',
                        fontWeight: 'bold',
                        border: '1px solid #00ff88',
                        padding: '2px 6px',
                        borderRadius: '4px'
                    }}>
                        ADMIN
                    </span>
                )}
                {question.category}
            </div>

            {/* Answers Grid */}
            <div className="answers-grid">
                {displayAnswers.map(({ text, index: originalIndex }, displayIndex) => {
                    const isSelected = selectedAnswer === displayIndex;
                    const isCorrectAnswer = originalIndex === question.correctIndex;
                    const showAsCorrect = isAnswered && isCorrectAnswer;
                    const showAsWrong = isAnswered && isSelected && !isCorrectAnswer;

                    return (
                        <motion.button
                            key={displayIndex}
                            className={`answer-option ${showAsCorrect ? 'correct' : ''} ${showAsWrong ? 'wrong' : ''}`}
                            variants={answerVariants}
                            initial="idle"
                            animate={
                                showAsCorrect ? 'correct' :
                                    showAsWrong ? 'wrong' :
                                        'idle'
                            }
                            whileHover={!isAnswered ? 'hover' : undefined}
                            onClick={() => handleAnswer(displayIndex, originalIndex)}
                            disabled={isAnswered}
                        >
                            <span className="answer-letter">{String.fromCharCode(65 + displayIndex)}</span>
                            <span className="answer-text">{text}</span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};
