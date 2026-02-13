import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDuelStore } from '../store/duelStore';
import { useGameStore } from '../store/gameStore';
import './DuelArena.css';

interface DuelArenaProps {
    currentQuestion: any;
}

export const DuelArena: React.FC<DuelArenaProps> = ({ currentQuestion }) => {


    const {
        setGamePhase,
        addPoints,
        consumeLife,
        nextQuestion,
        score,
        isDemoMode
    } = useGameStore();

    const {
        opponent,
        duelState,
        playerAnswered,
        opponentAnswered,
        result,
        recordPlayerAnswer,
        recordOpponentAnswer,
        completeDuel,
        resetDuelStore
    } = useDuelStore();

    const [startTime] = useState(Date.now());
    const [showingResult, setShowingResult] = useState(false);

    // Demo Mode: PvP Logic (Hotseat) - NO BOT SIMULATION
    // Both players (Admin A and Admin B) must click manually

    // Remove auto-play effects
    // Removed: Simulate opponent thinking useEffect
    // Removed: Demo Mode: Simulate Player thinking useEffect
    // Removed: Auto-continue in Demo Mode useEffect

    // Check for duel completion
    useEffect(() => {
        if (playerAnswered && opponentAnswered && !result) {
            const duelResult = completeDuel();
            if (duelResult) {
                setShowingResult(true);

                // Apply consequences ONLY if not in Demo Mode (or if separate admin score needed)
                // In Admin PvP, we might just want to show the winner without affecting global User score/lives
                // But user asked for "separate leaderboard"
                // So we'll handle score updates later or just let it be visual for now
                if (!isDemoMode && duelResult.winner === 'player') {
                    addPoints(duelResult.pointsStolen);
                } else if (!isDemoMode && duelResult.winner === 'opponent') {
                    consumeLife();
                }
            }
        }
    }, [playerAnswered, opponentAnswered, result, completeDuel, addPoints, consumeLife, isDemoMode]);

    const handleAnswerClick = (answerIndex: number, player: 'left' | 'right') => {
        if (showingResult) return;

        const isCorrect = answerIndex === currentQuestion.correctIndex;
        const answerTime = (Date.now() - startTime) / 1000;

        if (player === 'left') {
            if (playerAnswered) return;
            recordPlayerAnswer(isCorrect, answerTime);
        } else {
            if (opponentAnswered) return;
            recordOpponentAnswer(isCorrect, answerTime);
        }
    };

    const handleContinue = () => {
        resetDuelStore();
        setGamePhase('playing');
        nextQuestion();
    };

    if (!opponent) return null;

    return (
        <div className="duel-arena">
            {isDemoMode && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'linear-gradient(45deg, #ff0055, #ff00aa)',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: 20,
                    fontWeight: 'bold',
                    zIndex: 2000,
                    boxShadow: '0 0 15px rgba(255, 0, 85, 0.5)'
                }}>
                    ADMIN PvP MODE
                </div>
            )}
            <div className="duel-header">
                <div className="player-info">
                    <h3>{isDemoMode ? 'ADMIN A' : 'YOU'}</h3>
                    <div className="duel-score">{isDemoMode ? 'Ready' : score}</div>
                </div>
                <div className="duel-vs">
                    <span>VS</span>
                    <div className="duel-timer">
                        {/* Timer could go here */}
                    </div>
                </div>
                <div className="player-info opponent">
                    <h3>{isDemoMode ? 'ADMIN B' : opponent.name}</h3>
                    <div className="duel-score">{opponent.score}</div>
                </div>
            </div>

            <div className="duel-content">
                {/* Left Side (Player/Admin A) */}
                <div className={`duel-side player-side ${playerAnswered ? 'answered' : ''}`}>
                    <div className="duel-question-card">
                        <h2>{currentQuestion.text}</h2>
                        <div className="duel-options">
                            {currentQuestion.answers.map((answer: string, index: number) => (
                                <button
                                    key={index}
                                    className={`duel-option ${playerAnswered ? 'disabled' : ''}`}
                                    onClick={() => handleAnswerClick(index, 'left')}
                                    disabled={playerAnswered}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side (Opponent/Admin B) */}
                <div className={`duel-side opponent-side ${opponentAnswered ? 'answered' : ''}`}>
                    <div className="duel-question-card">
                        <h2>{currentQuestion.text}</h2>
                        <div className="duel-options">
                            {/* In Demo Mode, these are clickable. In Normal Mode, they are hidden/disabled visual only? 
                                Actually in normal mode right side is AI, so we don't show buttons?
                                Original design likely showed buttons for visual symmetry but disabled? 
                                Let's make them clickable ONLY if isDemoMode.
                            */}
                            {currentQuestion.answers.map((answer: string, index: number) => (
                                <button
                                    key={index}
                                    className={`duel-option ${opponentAnswered ? 'disabled' : ''}`}
                                    onClick={() => isDemoMode && handleAnswerClick(index, 'right')}
                                    disabled={!isDemoMode || opponentAnswered}
                                    style={{ opacity: isDemoMode ? 1 : 0.7, cursor: isDemoMode ? 'pointer' : 'default' }}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="status-badge" style={{ top: '20%', left: '20%' }}>
                {playerAnswered ? 'ANSWER LOCKED' : 'YOUR TURN'}
            </div>

            <div className="status-badge" style={{ top: '20%', right: '20%' }}>
                {opponentAnswered ? 'ANSWER LOCKED' : 'OPPONENT THINKING...'}
            </div>

            {/* Results Overlay */}
            <AnimatePresence>
                {showingResult && result && (
                    <motion.div
                        className={`duel-result-overlay ${result.winner === 'player' ? 'winner' : 'loser'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h1 className="result-title">
                            {result.winner === 'player' ? 'VICTORY!' : 'DEFEATED'}
                        </h1>

                        <div className="duel-stats">
                            <div className="stat-row">
                                <span>Your Time:</span>
                                <span>{result.playerTime.toFixed(2)}s</span>
                            </div>
                            <div className="stat-row">
                                <span>Opponent Time:</span>
                                <span>{result.opponentTime.toFixed(2)}s</span>
                            </div>
                            <div className="stat-row" style={{ marginTop: '20px', fontWeight: 'bold', color: result.winner === 'player' ? '#FFD700' : '#FF4500' }}>
                                {result.winner === 'player'
                                    ? `STOLEN: +${result.pointsStolen} PTS`
                                    : 'LOST 1 LIFE'}
                            </div>
                        </div>

                        <button
                            className="continue-btn"
                            onClick={handleContinue}
                            style={{
                                padding: '15px 40px',
                                fontSize: '20px',
                                background: 'white',
                                border: 'none',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            CONTINUE
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
