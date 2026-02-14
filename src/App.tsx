import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FireSystem } from './components/FireSystem';
import { GambleArena } from './components/GambleArena';
import { QuestionCard } from './components/QuestionCard';
import { ScoreCounter } from './components/ScoreCounter';
import { GameOver } from './components/GameOver';
import { ComboDisplay } from './components/ComboDisplay';
import { AchievementToast } from './components/AchievementToast';
import { Leaderboard } from './components/Leaderboard';
import { PowerUpInventory } from './components/PowerUpInventory';
import { ActiveEffects } from './components/ActiveEffects';
import { AttackAnimation } from './components/AttackAnimation';
import { DuelChallenge } from './components/DuelChallenge';
import { DuelArena } from './components/DuelArena';
import { TeamSelection } from './components/TeamSelection';
import { WaitingRoom } from './components/WaitingRoom';
import { OpponentStatus } from './components/OpponentStatus';
import { LiveNotifications } from './components/LiveNotifications';

import { useGameStore } from './store/gameStore';
import { useTeamStore } from './store/teamStore';
import { useAchievementStore, type Achievement } from './store/achievementStore';
import { useLeaderboardStore } from './store/leaderboardStore';
import { usePowerUpStore, type PowerUpType } from './store/powerUpStore';
import { useDuelStore } from './store/duelStore';

import { userQuestions, adminQuestions, shuffleQuestions, type Question } from './data/questions';
import './App.css';

function App() {
  const {
    score,
    streak,
    lives,
    questionIndex,
    gamePhase,
    sessionHistory,
    maxStreak,
    comboCount,
    comboMultiplier,
    incrementStreak,
    resetStreak,
    gambleWin,
    gambleLose,
    consumeLife,
    nextQuestion,
    restartGame,
    setGamePhase,
    addToHistory,
    addPoints,
    incrementCombo,
    resetCombo,
    updateCategoryStats,
    updateFastestAnswer,
    addSpeedBonus
  } = useGameStore();

  const { initializeAchievements, checkAndUnlock } = useAchievementStore();
  const { loadLeaderboard } = useLeaderboardStore();
  const { earnPowerUp, activeEffects, decrementEffectDurations, hasActiveEffect } = usePowerUpStore();
  const { incrementQuestionCounter: incrementDuelCounter } = useDuelStore();
  const { isTeamMode, myTeam, syncMyTeamData } = useTeamStore();

  const [fireIntensity, setFireIntensity] = useState(0);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState(100);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [currentAttackAnim, setCurrentAttackAnim] = useState<PowerUpType | null>(null);

  // Initialize stores on mount
  useEffect(() => {
    setGameQuestions(shuffleQuestions(userQuestions));
    initializeAchievements();
    loadLeaderboard();
  }, [initializeAchievements, loadLeaderboard]);

  // Watch for new active effects to trigger animations
  useEffect(() => {
    if (activeEffects.length > 0) {
      const latest = activeEffects[activeEffects.length - 1];
      // Only show animation if it was just applied (diff < 1000ms)
      if (Date.now() - latest.appliedAt < 1000) {
        setCurrentAttackAnim(latest.type);
      }
    }
  }, [activeEffects]);

  // Admin Demo Mode Trigger (Ctrl + Shift + X)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'x' || e.key === 'X')) {
        const { toggleDemoMode, isDemoMode } = useGameStore.getState();
        toggleDemoMode();

        // Restart game to return to menu with new mode active
        const { restartGame, setGamePhase } = useGameStore.getState();
        restartGame();

        // Load appropriate questions
        // Note: isDemoMode here is the *previous* value because we just called toggle
        // So if it WAS false (user mode), now it is true (admin mode)
        if (!isDemoMode) {
          setGameQuestions(shuffleQuestions(adminQuestions));
          setGamePhase('menu'); // Go to Admin Menu
        } else {
          setGameQuestions(shuffleQuestions(userQuestions));
          setGamePhase('menu'); // Return to User Menu
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleIntensityChange = (intensity: number) => {
    setFireIntensity(intensity);
  };

  const handleStartGame = () => {
    const { isDemoMode } = useGameStore.getState();
    restartGame();

    // Always use standard gameplay view for both modes now
    if (isDemoMode) {
      setGameQuestions(shuffleQuestions(adminQuestions));
    } else {
      setGameQuestions(shuffleQuestions(userQuestions));
    }
    setGamePhase('playing');
  };

  const handleAnswerSelected = (answerIndex: number, isCorrect: boolean, answerTime: number) => {
    const currentQuestion = gameQuestions[questionIndex];

    if (isCorrect) {
      console.log('✓ Correct answer!');

      // Increment streak and combo (unless frozen)
      incrementStreak();

      // Sync with Firebase in team mode
      if (isTeamMode && myTeam) {
        syncMyTeamData({ streak: streak + 1 });
      }

      const isFrozen = hasActiveEffect('freeze');
      if (!isFrozen) {
        incrementCombo();
      }

      // Decrement effect durations
      decrementEffectDurations();
      incrementDuelCounter();

      // Update category stats
      updateCategoryStats(currentQuestion.category, true);

      // Track fastest answer
      updateFastestAnswer(answerTime);

      // Check for speed bonus
      let speedBonus = 0;
      if (answerTime < 3) {
        speedBonus = 100;
        addSpeedBonus();
        earnPowerUp('timePressure'); // Earn Time Pressure on very fast answer
      } else if (answerTime < 5) {
        speedBonus = 50;
        addSpeedBonus();
      }

      // Check power-up earning milestones
      if (streak + 1 === 3) earnPowerUp('pointSteal');
      if (streak + 1 === 5) earnPowerUp('freeze');
      if (streak + 1 === 7) earnPowerUp('scramble');

      // Perfect Category bonus check happens in store, 
      // but let's say perfect answer gives life drain chance
      if (Math.random() > 0.9) earnPowerUp('lifeDrain'); // Rare drop

      // Calculate base points with combo multiplier
      const basePoints = 100 + (streak * 10);
      const totalPoints = (basePoints + speedBonus) * (isFrozen ? 1 : comboMultiplier);
      setCurrentQuestionPoints(totalPoints);
      addPoints(totalPoints);

      // Sync score with Firebase in team mode
      if (isTeamMode && myTeam) {
        syncMyTeamData({ score: score + totalPoints });
      }

      // Add to history
      addToHistory({
        correct: true,
        points: totalPoints,
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        answerTime
      });

      // Check achievements
      if (sessionHistory.filter(h => h.correct).length === 0) {
        const achievement = checkAndUnlock('first_blood');
        if (achievement) setUnlockedAchievement(achievement);
      }

      // Trigger gamble phase
      setTimeout(() => {
        setGamePhase('gamble');
      }, 1000);

    } else {
      console.log('✗ Wrong answer!');

      // Reset streak and combo
      resetStreak();
      resetCombo();

      // Update category stats
      updateCategoryStats(currentQuestion.category, false);

      // Consume life
      consumeLife();

      // Sync lives with Firebase in team mode
      if (isTeamMode && myTeam) {
        syncMyTeamData({ lives: lives - 1 });
      }

      // Add to history
      addToHistory({
        correct: false,
        points: 0,
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        answerTime
      });

      // Move to next question or game over
      setTimeout(() => {
        if (lives > 1) {
          nextQuestion();
        }
        // If lives = 1, consumeLife will set gamePhase to 'gameOver'
      }, 1500);
    }
  };

  const handleBank = () => {
    console.log('Banked points!');

    // Move to next question
    if (questionIndex < gameQuestions.length - 1) {
      nextQuestion();
    } else {
      // No more questions
      setGamePhase('gameOver');
    }
  };

  const handleGamble = (type: 'double' | 'triple' | 'allin', result: boolean) => {
    if (result) {
      // Enhanced multipliers: double=2x, triple=4x, allin=6x
      const multiplier = type === 'double' ? 2 : type === 'triple' ? 4 : 6;
      gambleWin(multiplier, currentQuestionPoints, type === 'allin');

      // Check achievements
      const achievement = checkAndUnlock('risk_taker');
      if (achievement) setUnlockedAchievement(achievement);

      // Check for high roller (3 AllIn wins)
      if (type === 'allin') {
        const { allInWins } = useGameStore.getState();
        if (allInWins >= 3) {
          const highRoller = checkAndUnlock('high_roller');
          if (highRoller) setUnlockedAchievement(highRoller);
        }
      }
    } else {
      gambleLose();
      resetCombo(); // Reset combo on gamble loss
    }

    // Move to next question
    setTimeout(() => {
      if (questionIndex < gameQuestions.length - 1) {
        nextQuestion();
      } else {
        // No more questions
        setGamePhase('gameOver');
      }
    }, 500);
  };

  const handleTeamSelected = () => {
    setShowTeamSelection(false);
    setShowWaitingRoom(true);
  };

  const handleGameStart = () => {
    setShowWaitingRoom(false);
    setGamePhase('playing');
  };

  const handleEnableTeamMode = () => {
    setShowTeamSelection(true);
  };

  return (
    <>
      {/* Team Mode Screens */}
      {showTeamSelection && (
        <TeamSelection onTeamSelected={handleTeamSelected} />
      )}

      {showWaitingRoom && (
        <WaitingRoom onGameStart={handleGameStart} />
      )}

      {/* Team Mode UI Elements */}
      {isTeamMode && gamePhase === 'playing' && (
        <>
          <OpponentStatus />
          <LiveNotifications />
        </>
      )}

      <ActiveEffects />

      <AttackAnimation
        type={currentAttackAnim}
        onComplete={() => setCurrentAttackAnim(null)}
      />

      <DuelChallenge />

      {/* Fire System - Always visible, intensity based on streak */}
      <FireSystem
        streakLevel={streak}
        isActive={gamePhase === 'playing' || gamePhase === 'gamble'}
        onIntensityChange={handleIntensityChange}
      />

      {/* Power Up Inventory */}
      {(gamePhase === 'playing' || gamePhase === 'gamble') && (
        <PowerUpInventory />
      )}

      {/* Score Counter - Visible during gameplay */}
      {(gamePhase === 'playing' || gamePhase === 'gamble') && (
        <ScoreCounter score={score} streak={streak} lives={lives} />
      )}

      {/* Combo Display - Shows during gameplay when combo >= 2 */}
      {(gamePhase === 'playing' || gamePhase === 'gamble') && (
        <ComboDisplay comboCount={comboCount} multiplier={comboMultiplier} />
      )}

      {/* Achievement Toast */}
      <AchievementToast
        achievement={unlockedAchievement}
        onDismiss={() => setUnlockedAchievement(null)}
      />

      {/* Menu Screen */}
      {gamePhase === 'menu' && (
        <div className="menu-screen">
          <div className="menu-container" style={useGameStore.getState().isDemoMode ? { borderColor: '#00ff88', boxShadow: '0 0 50px rgba(0, 255, 136, 0.3)' } : {}}>
            <h1 className="game-title" style={useGameStore.getState().isDemoMode ? { background: 'linear-gradient(135deg, #00ff88, #00b8ff)', WebkitBackgroundClip: 'text' } : {}}>
              {useGameStore.getState().isDemoMode ? '⚡ ADMIN TRIVIA ⚡' : '🔥 Blaze Trivia Arena 🔥'}
            </h1>
            <p className="game-subtitle">
              {useGameStore.getState().isDemoMode ? 'ADMIN MODE: Play with Original Questions' : 'Answer questions, build your streak, and risk it all!'}
            </p>
            <button
              className="start-button"
              onClick={handleStartGame}
              style={useGameStore.getState().isDemoMode ? { background: 'linear-gradient(135deg, #00ff88, #00b8ff)', padding: '1.5rem 2rem' } : {}}
            >
              {useGameStore.getState().isDemoMode ? 'START ADMIN GAME ▶' : 'Start Game'}
            </button>

            <button
              className="team-mode-button"
              onClick={handleEnableTeamMode}
              style={{ marginTop: '15px', background: 'linear-gradient(135deg, #FFD700, #FF6347)', padding: '1rem 2rem' }}
            >
              🏆 TEAM BATTLE MODE 🏆
            </button>
            <div className="game-rules">
              <h3>To Play:</h3>
              <ul>
                <li>Answer trivia questions correctly to build your streak</li>
                <li>Build combos for 2x, 3x, 4x multipliers!</li>
                <li>Collect Power-Ups to attack opponents!</li>
                <li>Challenge players to 1v1 Duels!</li>
                <li>Unlock achievements and climb the leaderboard!</li>
              </ul>
            </div>

            {/* Leaderboard */}
            <Leaderboard />
          </div>
        </div>
      )}

      {/* Question Phase */}
      {gamePhase === 'playing' && gameQuestions[questionIndex] && (
        <div className="game-container">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={questionIndex}
              question={gameQuestions[questionIndex]}
              streak={streak}
              onAnswerSelected={handleAnswerSelected}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Gamble Phase */}
      {gamePhase === 'gamble' && (
        <GambleArena
          currentPoints={currentQuestionPoints}
          streakLevel={streak}
          onBank={handleBank}
          onGamble={handleGamble}
        />
      )}

      {/* Duel Phase */}
      {gamePhase === 'duel' && gameQuestions[questionIndex] && (
        <DuelArena currentQuestion={gameQuestions[questionIndex]} />
      )}

      {/* Game Over Screen */}
      {gamePhase === 'gameOver' && (
        <GameOver
          finalScore={score}
          maxStreak={maxStreak}
          questionsAnswered={sessionHistory.length}
          correctAnswers={sessionHistory.filter(h => h.correct).length}
        />
      )}
    </>
  );
}

export default App;
