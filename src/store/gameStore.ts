import { create } from 'zustand';

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
}

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    score: 0,
    streak: 0,
    lives: 5,
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
    timeAttackRemaining: 180, // 3 minutes
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
        let multiplier = 1;

        if (newCombo >= 5) multiplier = 4;
        else if (newCombo >= 3) multiplier = 3;
        else if (newCombo >= 2) multiplier = 2;

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
                bonus += 200; // 200 points per perfect category
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
    }))
}));
