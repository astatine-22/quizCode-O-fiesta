import { create } from 'zustand';
import { GAME_CONFIG, calculateComboMultiplier, calculateSpeedBonus, getGambleMultiplier, type GambleType } from '../config/gameConfig';

export type GamePhase = 'menu' | 'playing' | 'gamble' | 'duel' | 'gameOver';
export type GameMode = 'normal' | 'timeAttack';

interface GameHistory {
    correct: boolean;
    points: number;
    questionId: number;
    category: string;
    answerTime: number;
}

interface CategoryStats {
    [category: string]: {
        correct: number;
        total: number;
    };
}

interface GameState {
    // Core game state
    score: number;
    streak: number;
    lives: number;
    questionIndex: number;
    gamePhase: GamePhase;
    sessionHistory: GameHistory[];
    maxStreak: number;

    // Competitive features
    gameMode: GameMode;
    comboCount: number;
    comboMultiplier: number;
    categoryStats: CategoryStats;
    totalGameTime: number;
    fastestAnswer: number;
    gamblesWon: number;
    gamblesLost: number;
    allInWins: number;
    speedBonusCount: number;
    isDemoMode: boolean; // New state for Admin Demo

    // Time Attack
    timeAttackRemaining: number;

    // Actions
    incrementStreak: () => void;
    resetStreak: () => void;
    toggleDemoMode: () => void; // New action
    gambleWin: (multiplier: number, basePoints: number, isAllIn?: boolean) => void;
    gambleLose: () => void;
    consumeLife: () => void;
    nextQuestion: () => void;
    restartGame: () => void;
    setGamePhase: (phase: GamePhase) => void;
    addToHistory: (entry: GameHistory) => void;
    addPoints: (points: number) => void;

    // Combo actions
    incrementCombo: () => void;
    resetCombo: () => void;
    getComboMultiplier: () => number;

    // Category actions
    updateCategoryStats: (category: string, correct: boolean) => void;
    getCategoryPerfectBonus: () => number;

    // Time tracking
    setGameMode: (mode: GameMode) => void;
    updateGameTime: (time: number) => void;
    updateFastestAnswer: (time: number) => void;
    addSpeedBonus: () => void;

    // Time Attack
    setTimeAttackRemaining: (time: number) => void;
    addTimeBonus: (seconds: number) => void;
    subtractTimePenalty: (seconds: number) => void;

    // Encapsulated Game Logic Actions
    submitAnswer: (answerIndex: number, isCorrect: boolean, answerTime: number, questionData: { id: number; category: string }) => { shouldTransitionToGamble: boolean; points: number };
    handleBankAction: () => { shouldContinue: boolean };
    handleGambleAction: (type: GambleType, result: boolean, currentQuestionPoints: number) => { shouldContinue: boolean };
}

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    score: GAME_CONFIG.INITIAL_SCORE,
    streak: GAME_CONFIG.INITIAL_STREAK,
    lives: GAME_CONFIG.INITIAL_LIVES,
    questionIndex: 0,
    gamePhase: 'menu',
    sessionHistory: [],
    maxStreak: 0,

    // Competitive features initial state
    gameMode: 'normal',
    comboCount: 0,
    comboMultiplier: 1,
    categoryStats: {},
    totalGameTime: 0,
    fastestAnswer: Infinity,
    gamblesWon: 0,
    gamblesLost: 0,
    allInWins: 0,
    speedBonusCount: 0,
    timeAttackRemaining: GAME_CONFIG.TIME_ATTACK.INITIAL_TIME,
    isDemoMode: false,

    toggleDemoMode: () => set((state) => {
        const newMode = !state.isDemoMode;
        console.log(`[GameStore] Demo Mode: ${newMode ? 'ACTIVATED' : 'DEACTIVATED'}`);
        return { isDemoMode: newMode };
    }),

    // Increment streak (on correct answer)
    incrementStreak: () => set((state) => {
        const newStreak = state.streak + 1;
        console.log(`[GameStore] Streak incremented: ${state.streak} → ${newStreak}`);
        return {
            streak: newStreak,
            maxStreak: Math.max(state.maxStreak, newStreak)
        };
    }),

    // Reset streak (on wrong answer)
    resetStreak: () => set((state) => {
        console.log(`[GameStore] Streak reset: ${state.streak} → 0`);
        return { streak: 0 };
    }),

    // Gamble win - multiply points and add to score
    gambleWin: (multiplier, basePoints, isAllIn = false) => set((state) => {
        const wonPoints = basePoints * multiplier;
        console.log(`[GameStore] Gamble WIN: ${basePoints} × ${multiplier} = ${wonPoints} points`);
        return {
            score: state.score + wonPoints,
            gamblesWon: state.gamblesWon + 1,
            allInWins: isAllIn ? state.allInWins + 1 : state.allInWins
        };
    }),

    // Gamble lose - no points added
    gambleLose: () => set((state) => {
        console.log(`[GameStore] Gamble LOSE: No points added`);
        return {
            gamblesLost: state.gamblesLost + 1
        };
    }),

    // Consume a life
    consumeLife: () => set((state) => {
        const newLives = state.lives - 1;
        console.log(`[GameStore] Life consumed: ${state.lives} → ${newLives}`);

        // Check for game over
        if (newLives <= 0) {
            console.log(`[GameStore] GAME OVER - No lives remaining`);
            return {
                lives: 0,
                gamePhase: 'gameOver'
            };
        }

        return { lives: newLives };
    }),

    // Move to next question
    nextQuestion: () => set((state) => {
        const newIndex = state.questionIndex + 1;
        console.log(`[GameStore] Next question: ${state.questionIndex} → ${newIndex}`);
        return {
            questionIndex: newIndex,
            gamePhase: 'playing'
        };
    }),

    // Restart game
    restartGame: () => set(() => {
        console.log(`[GameStore] Game restarted`);
        return {
            score: 0,
            streak: 0,
            lives: 5,
            questionIndex: 0,
            gamePhase: 'playing',
            sessionHistory: [],
            maxStreak: 0,
            comboCount: 0,
            comboMultiplier: 1,
            categoryStats: {},
            totalGameTime: 0,
            fastestAnswer: Infinity,
            gamblesWon: 0,
            gamblesLost: 0,
            allInWins: 0,
            speedBonusCount: 0,
            timeAttackRemaining: 180
        };
    }),

    // Set game phase
    setGamePhase: (phase) => set((state) => {
        console.log(`[GameStore] Phase change: ${state.gamePhase} → ${phase}`);
        return { gamePhase: phase };
    }),

    // Add to history
    addToHistory: (entry) => set((state) => ({
        sessionHistory: [...state.sessionHistory, entry]
    })),

    // Add points directly (for correct answers before gamble)
    addPoints: (points) => set((state) => {
        console.log(`[GameStore] Points added: ${points}`);
        return {
            score: state.score + points
        };
    }),

    // Combo actions
    incrementCombo: () => set((state) => {
        const newCombo = state.comboCount + 1;
        const multiplier = calculateComboMultiplier(newCombo);

        console.log(`[GameStore] Combo: ${newCombo} (${multiplier}x)`);
        return {
            comboCount: newCombo,
            comboMultiplier: multiplier
        };
    }),

    resetCombo: () => set(() => {
        console.log(`[GameStore] Combo reset`);
        return {
            comboCount: 0,
            comboMultiplier: 1
        };
    }),

    getComboMultiplier: () => get().comboMultiplier,

    // Category actions
    updateCategoryStats: (category, correct) => set((state) => {
        const stats = state.categoryStats[category] || { correct: 0, total: 0 };
        return {
            categoryStats: {
                ...state.categoryStats,
                [category]: {
                    correct: stats.correct + (correct ? 1 : 0),
                    total: stats.total + 1
                }
            }
        };
    }),

    getCategoryPerfectBonus: () => {
        const { categoryStats } = get();
        let bonus = 0;

        Object.values(categoryStats).forEach(stats => {
            if (stats.total > 0 && stats.correct === stats.total) {
                bonus += GAME_CONFIG.CATEGORY_PERFECT_BONUS;
            }
        });

        return bonus;
    },

    // Time tracking
    setGameMode: (mode) => set({ gameMode: mode }),

    updateGameTime: (time) => set({ totalGameTime: time }),

    updateFastestAnswer: (time) => set((state) => ({
        fastestAnswer: Math.min(state.fastestAnswer, time)
    })),

    addSpeedBonus: () => set((state) => ({
        speedBonusCount: state.speedBonusCount + 1
    })),

    // Time Attack
    setTimeAttackRemaining: (time) => set({ timeAttackRemaining: time }),

    addTimeBonus: (seconds) => set((state) => ({
        timeAttackRemaining: state.timeAttackRemaining + seconds
    })),

    subtractTimePenalty: (seconds) => set((state) => ({
        timeAttackRemaining: Math.max(0, state.timeAttackRemaining - seconds)
    })),

    // Encapsulated Game Logic Actions
    submitAnswer: (_answerIndex, isCorrect, answerTime, questionData) => {
        const state = get();

        if (isCorrect) {
            console.log('✓ Correct answer!');

            // Increment streak
            const newStreak = state.streak + 1;
            set({
                streak: newStreak,
                maxStreak: Math.max(state.maxStreak, newStreak)
            });

            // Increment combo (will be handled by caller if frozen)
            // Caller should check hasActiveEffect('freeze') before calling incrementCombo

            // Update category stats
            get().updateCategoryStats(questionData.category, true);

            // Track fastest answer
            get().updateFastestAnswer(answerTime);

            // Calculate speed bonus
            const speedBonusResult = calculateSpeedBonus(answerTime);
            if (speedBonusResult.points > 0) {
                get().addSpeedBonus();
            }

            // Calculate base points with combo multiplier
            const basePoints = GAME_CONFIG.BASE_POINTS + (newStreak * GAME_CONFIG.STREAK_BONUS_PER_LEVEL);
            const totalPoints = (basePoints + speedBonusResult.points) * state.comboMultiplier;

            // Add points
            get().addPoints(totalPoints);

            // Add to history
            get().addToHistory({
                correct: true,
                points: totalPoints,
                questionId: questionData.id,
                category: questionData.category,
                answerTime
            });

            return { shouldTransitionToGamble: true, points: totalPoints };
        } else {
            console.log('✗ Wrong answer!');

            // Reset streak and combo
            get().resetStreak();
            get().resetCombo();

            // Update category stats
            get().updateCategoryStats(questionData.category, false);

            // Consume life
            get().consumeLife();

            // Add to history
            get().addToHistory({
                correct: false,
                points: 0,
                questionId: questionData.id,
                category: questionData.category,
                answerTime
            });

            return { shouldTransitionToGamble: false, points: 0 };
        }
    },

    handleBankAction: () => {
        // Just move to next question
        // Caller will check if there are more questions
        return { shouldContinue: true };
    },

    handleGambleAction: (type, result, currentQuestionPoints) => {
        if (result) {
            const multiplier = getGambleMultiplier(type);
            get().gambleWin(multiplier, currentQuestionPoints, type === 'allin');
        } else {
            get().gambleLose();
            get().resetCombo(); // Reset combo on gamble loss
        }

        return { shouldContinue: true };
    }
}));
