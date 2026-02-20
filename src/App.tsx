import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FireSystem } from './components/FireSystem';
import { PowerUpInventory } from './components/PowerUpInventory';
import { ActiveEffects } from './components/ActiveEffects';
import { AttackAnimation } from './components/AttackAnimation';
import { DuelChallenge } from './components/DuelChallenge';
import { TeamSelection } from './components/TeamSelection';
import { WaitingRoom } from './components/WaitingRoom';
import { ErrorBoundary } from './components/ErrorBoundary';

import { useGameStore } from './store/gameStore';
import { useTeamStore } from './store/teamStore';
import { useAchievementStore, type Achievement } from './store/achievementStore';
import { useLeaderboardStore } from './store/leaderboardStore';
import { usePowerUpStore, type PowerUpType } from './store/powerUpStore';
import { useDuelStore } from './store/duelStore';

import { userQuestions, adminQuestions, shuffleQuestions, type Question } from './data/questions';
import { GAME_CONFIG } from './config/gameConfig';
import type { GambleType } from './config/gameConfig';

// Lazy-loaded views for code splitting
const MainMenuView = lazy(() => import('./views/MainMenuView').then(m => ({ default: m.MainMenuView })));
const GameplayView = lazy(() => import('./views/GameplayView').then(m => ({ default: m.GameplayView })));
const GambleView = lazy(() => import('./views/GambleView').then(m => ({ default: m.GambleView })));
const GameOverView = lazy(() => import('./views/GameOverView').then(m => ({ default: m.GameOverView })));
const DuelArena = lazy(() => import('./components/DuelArena').then(m => ({ default: m.DuelArena })));

// Lazy-loaded components
const AchievementToast = lazy(() => import('./components/AchievementToast').then(m => ({ default: m.AchievementToast })));

import './App.css';

function App() {
  // Zustand store selectors
  const {
    questionIndex,
    gamePhase,
    restartGame,
    setGamePhase,
    submitAnswer,
    handleBankAction,
    handleGambleAction,
    nextQuestion,
    incrementCombo,
  } = useGameStore();

  const { initializeAchievements, checkAndUnlock } = useAchievementStore();
  const { loadLeaderboard } = useLeaderboardStore();
  const { earnPowerUp, activeEffects, hasActiveEffect } = usePowerUpStore();
  const { incrementQuestionCounter: incrementDuelCounter } = useDuelStore();
  const { isTeamMode, myTeam, syncMyTeamData } = useTeamStore();

  // Local state
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState(100);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [currentAttackAnim, setCurrentAttackAnim] = useState<PowerUpType | null>(null);

  // Timeout refs for cleanup
  const timeoutRefs = useRef<number[]>([]);

  // Helper to add timeout with cleanup tracking
  const addTimeout = (callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      callback();
      // Remove from tracking array
      timeoutRefs.current = timeoutRefs.current.filter(t => t !== timeout);
    }, delay);
    timeoutRefs.current.push(timeout);
    return timeout;
  };

  // Cleanup all timeouts on unmount or game restart
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, []);

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
        restartGame();

        if (!isDemoMode) {
          setGameQuestions(shuffleQuestions(adminQuestions));
          setGamePhase('menu');
        } else {
          setGameQuestions(shuffleQuestions(userQuestions));
          setGamePhase('menu');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [restartGame, setGamePhase]);


  const handleAnswerSelected = (answerIndex: number, isCorrect: boolean, answerTime: number) => {
    const currentQuestion = gameQuestions[questionIndex];

    // Use the encapsulated game logic from the store
    const result = submitAnswer(answerIndex, isCorrect, answerTime, {
      id: currentQuestion.id,
      category: currentQuestion.category,
    });

    if (isCorrect) {
      // Handle combo increment (check for freeze effect)
      const isFrozen = hasActiveEffect('freeze');
      if (!isFrozen) {
        incrementCombo();
      }

      // Sync with Firebase in team mode
      if (isTeamMode && myTeam) {
        const { streak, score } = useGameStore.getState();
        syncMyTeamData({ streak, score });
      }

      // Decrement effect durations and increment duel counter
      const { decrementEffectDurations } = usePowerUpStore.getState();
      decrementEffectDurations();
      incrementDuelCounter();

      // Check for speed bonus power-up earning
      if (answerTime < GAME_CONFIG.SPEED_BONUS.VERY_FAST_THRESHOLD) {
        earnPowerUp('timePressure');
      }

      // Check power-up earning milestones
      const { streak } = useGameStore.getState();
      if (streak === GAME_CONFIG.ACHIEVEMENTS.POWER_UP_UNLOCK_STREAK) {
        earnPowerUp('pointSteal');
        earnPowerUp('freeze');
        earnPowerUp('scramble');
        earnPowerUp('lifeDrain');

        // Sync earned power-ups to Firebase so the opponent player can see
        if (isTeamMode && myTeam) {
          const { inventory } = usePowerUpStore.getState();
          syncMyTeamData({ powerUps: inventory });
        }
      }

      // Random life drain drop
      if (Math.random() < GAME_CONFIG.POWER_UP_DROP_RATES.LIFE_DRAIN_CHANCE) {
        earnPowerUp('lifeDrain');

        // Sync earned power-up to Firebase
        if (isTeamMode && myTeam) {
          const { inventory } = usePowerUpStore.getState();
          syncMyTeamData({ powerUps: inventory });
        }
      }

      // Store points for gamble phase
      setCurrentQuestionPoints(result.points);

      // Check achievements
      const { sessionHistory } = useGameStore.getState();
      if (sessionHistory.filter(h => h.correct).length === 1) {
        const achievement = checkAndUnlock('first_blood');
        if (achievement) setUnlockedAchievement(achievement);
      }

      // Transition to gamble phase
      addTimeout(() => {
        setGamePhase('gamble');
      }, GAME_CONFIG.TRANSITIONS.CORRECT_ANSWER_TO_GAMBLE);
    } else {
      // Sync lives with Firebase in team mode
      if (isTeamMode && myTeam) {
        const { lives } = useGameStore.getState();
        syncMyTeamData({ lives });
      }

      // Move to next question or game over (handled by store)
      addTimeout(() => {
        const { lives } = useGameStore.getState();
        if (lives > 0) {
          nextQuestion();
        }
      }, GAME_CONFIG.TRANSITIONS.WRONG_ANSWER_TO_NEXT);
    }
  };

  const handleBank = () => {
    console.log('Banked points!');
    handleBankAction();

    if (questionIndex < gameQuestions.length - 1) {
      nextQuestion();
    } else {
      setGamePhase('gameOver');
    }
  };

  const handleGamble = (type: GambleType, result: boolean) => {
    handleGambleAction(type, result, currentQuestionPoints);

    // Check achievements
    if (result) {
      const achievement = checkAndUnlock('risk_taker');
      if (achievement) setUnlockedAchievement(achievement);

      if (type === 'allin') {
        const { allInWins } = useGameStore.getState();
        if (allInWins >= GAME_CONFIG.ACHIEVEMENTS.HIGH_ROLLER_ALLIN_WINS) {
          const highRoller = checkAndUnlock('high_roller');
          if (highRoller) setUnlockedAchievement(highRoller);
        }
      }
    }

    // Move to next question
    addTimeout(() => {
      if (questionIndex < gameQuestions.length - 1) {
        nextQuestion();
      } else {
        setGamePhase('gameOver');
      }
    }, GAME_CONFIG.TRANSITIONS.GAMBLE_RESULT_TO_NEXT);
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

  const handleErrorReset = () => {
    // Clear all timeouts
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    // Reset to menu
    restartGame();
    setGamePhase('menu');
  };

  return (
    <ErrorBoundary onReset={handleErrorReset}>
      {/* Team Mode Screens */}
      {showTeamSelection && (
        <TeamSelection onTeamSelected={handleTeamSelected} />
      )}

      {showWaitingRoom && (
        <WaitingRoom onGameStart={handleGameStart} />
      )}

      {/* Global UI Elements */}
      <ActiveEffects />
      <AttackAnimation
        type={currentAttackAnim}
        onComplete={() => setCurrentAttackAnim(null)}
      />
      <DuelChallenge />

      {/* Fire System - Always visible */}
      <FireSystem />

      {/* Power Up Inventory */}
      {(gamePhase === 'playing' || gamePhase === 'gamble') && (
        <PowerUpInventory />
      )}

      {/* Achievement Toast */}
      <Suspense fallback={null}>
        <AchievementToast
          achievement={unlockedAchievement}
          onDismiss={() => setUnlockedAchievement(null)}
        />
      </Suspense>

      {/* View Routing with Suspense */}
      <Suspense fallback={<div className="loading-screen">Loading...</div>}>
        <AnimatePresence mode="wait">
          {gamePhase === 'menu' && (
            <MainMenuView
              onEnableTeamMode={handleEnableTeamMode}
            />
          )}

          {gamePhase === 'playing' && gameQuestions[questionIndex] && (
            <GameplayView
              currentQuestion={gameQuestions[questionIndex]}
              questionIndex={questionIndex}
              onAnswerSelected={handleAnswerSelected}
            />
          )}

          {gamePhase === 'gamble' && (
            <GambleView
              currentPoints={currentQuestionPoints}
              onBank={handleBank}
              onGamble={handleGamble}
            />
          )}

          {gamePhase === 'duel' && gameQuestions[questionIndex] && (
            <DuelArena currentQuestion={gameQuestions[questionIndex]} />
          )}

          {gamePhase === 'gameOver' && (
            <GameOverView />
          )}
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
