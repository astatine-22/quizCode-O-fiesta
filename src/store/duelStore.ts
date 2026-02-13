import { create } from 'zustand';
import type { LeaderboardEntry } from './leaderboardStore';

export type DuelState = 'idle' | 'selecting' | 'active' | 'completed';

export interface DuelOpponent {
    id: string;
    name: string;
    score: number;
    answerTime?: number; // Simulated answer time for AI opponent
}

export interface DuelResult {
    winner: 'player' | 'opponent';
    playerTime: number;
    opponentTime: number;
    pointsStolen: number;
    lifeLost: boolean;
}

interface DuelStoreState {
    // State
    duelState: DuelState;
    opponent: DuelOpponent | null;
    questionsSinceLastDuel: number;
    duelCooldown: number; // Number of questions before next duel allowed

    // Duel progress
    playerAnswered: boolean;
    playerAnswerTime: number;
    playerCorrect: boolean;

    opponentAnswered: boolean;
    opponentAnswerTime: number;
    opponentCorrect: boolean;

    result: DuelResult | null;

    // Stats
    duelsWon: number;
    duelsLost: number;
    totalPointsStolen: number;

    // Actions
    startDuelSelection: () => boolean; // Returns true if duel available
    selectOpponent: (opponent: LeaderboardEntry) => void;
    cancelDuel: () => void;
    startDuel: () => void;

    recordPlayerAnswer: (correct: boolean, time: number) => void;
    recordOpponentAnswer: (correct: boolean, time: number) => void;

    // Kept for backward compatibility or future bot vs user
    simulateOpponentAnswer: () => void;

    completeDuel: () => DuelResult | null;
    incrementQuestionCounter: () => void;

    canChallenge: () => boolean;
    getQuestionsUntilDuel: () => number;

    resetDuelStore: () => void;
}

const DUEL_COOLDOWN = 5; // Questions between duels
const BASE_POINTS_STOLEN = 150;

export const useDuelStore = create<DuelStoreState>((set, get) => ({
    // Initial state
    duelState: 'idle',
    opponent: null,
    questionsSinceLastDuel: DUEL_COOLDOWN, // Start ready
    duelCooldown: DUEL_COOLDOWN,

    playerAnswered: false,
    playerAnswerTime: 0,
    playerCorrect: false,

    opponentAnswered: false,
    opponentAnswerTime: 0,
    opponentCorrect: false,

    result: null,

    duelsWon: 0,
    duelsLost: 0,
    totalPointsStolen: 0,

    startDuelSelection: () => {
        const state = get();

        if (state.questionsSinceLastDuel < DUEL_COOLDOWN) {
            console.warn(`[Duel] Cooldown active: ${DUEL_COOLDOWN - state.questionsSinceLastDuel} questions remaining`);
            return false;
        }

        console.log('[Duel] Starting opponent selection');
        set({ duelState: 'selecting' });
        return true;
    },

    selectOpponent: (opponent) => {
        console.log(`[Duel] Opponent selected: ${opponent.playerName}`);
        set({
            opponent: {
                id: opponent.id,
                name: opponent.playerName,
                score: opponent.score
            }
        });
    },

    cancelDuel: () => {
        console.log('[Duel] Cancelled');
        set({
            duelState: 'idle',
            opponent: null,
            playerAnswered: false,
            opponentAnswered: false,
            result: null
        });
    },

    startDuel: () => {
        console.log('[Duel] Starting battle!');
        set({
            duelState: 'active',
            playerAnswered: false,
            playerAnswerTime: 0,
            playerCorrect: false,
            opponentAnswered: false,
            opponentAnswerTime: 0,
            opponentCorrect: false,
            result: null
        });
    },

    recordPlayerAnswer: (correct, time) => {
        console.log(`[Duel] Player answered: ${correct ? 'correct' : 'wrong'} in ${time.toFixed(2)}s`);
        set({
            playerAnswered: true,
            playerAnswerTime: time,
            playerCorrect: correct
        });
    },

    recordOpponentAnswer: (correct, time) => {
        console.log(`[Duel] Opponent answered: ${correct ? 'correct' : 'wrong'} in ${time.toFixed(2)}s`);
        set({
            opponentAnswered: true,
            opponentAnswerTime: time,
            opponentCorrect: correct
        });
    },

    simulateOpponentAnswer: () => {
        // Simulate opponent answer (70% correct, random time 3-8s)
        const correct = Math.random() > 0.3;
        const time = 3 + Math.random() * 5;
        // Use the manual recording function
        get().recordOpponentAnswer(correct, time);
    },

    completeDuel: () => {
        const state = get();

        if (!state.playerAnswered || !state.opponentAnswered) {
            console.warn('[Duel] Cannot complete: waiting for answers');
            return null;
        }

        let winner: 'player' | 'opponent';
        let pointsStolen = 0;
        let lifeLost = false;

        // Determine winner
        if (state.playerCorrect && !state.opponentCorrect) {
            winner = 'player';
        } else if (!state.playerCorrect && state.opponentCorrect) {
            winner = 'opponent';
        } else if (state.playerCorrect && state.opponentCorrect) {
            // Both correct - faster wins
            winner = state.playerAnswerTime < state.opponentAnswerTime ? 'player' : 'opponent';
        } else {
            // Both wrong - faster loses (penalty)
            winner = state.playerAnswerTime > state.opponentAnswerTime ? 'player' : 'opponent';
        }

        // Calculate points stolen
        if (winner === 'player') {
            pointsStolen = BASE_POINTS_STOLEN;
            lifeLost = false;
        } else {
            pointsStolen = 0;
            lifeLost = true; // Player loses a life
        }

        const result: DuelResult = {
            winner,
            playerTime: state.playerAnswerTime,
            opponentTime: state.opponentAnswerTime,
            pointsStolen,
            lifeLost
        };

        console.log(`[Duel] Winner: ${winner}, Points stolen: ${pointsStolen}`);

        set({
            duelState: 'completed',
            result,
            questionsSinceLastDuel: 0, // Reset cooldown
            duelsWon: winner === 'player' ? state.duelsWon + 1 : state.duelsWon,
            duelsLost: winner === 'opponent' ? state.duelsLost + 1 : state.duelsLost,
            totalPointsStolen: state.totalPointsStolen + pointsStolen
        });

        return result;
    },

    incrementQuestionCounter: () => {
        set((state) => ({
            questionsSinceLastDuel: Math.min(state.questionsSinceLastDuel + 1, DUEL_COOLDOWN)
        }));
    },

    canChallenge: () => {
        const state = get();
        return state.questionsSinceLastDuel >= DUEL_COOLDOWN && state.duelState === 'idle';
    },

    getQuestionsUntilDuel: () => {
        const state = get();
        return Math.max(0, DUEL_COOLDOWN - state.questionsSinceLastDuel);
    },

    resetDuelStore: () => {
        console.log('[Duel] Store reset');
        set({
            duelState: 'idle',
            opponent: null,
            questionsSinceLastDuel: DUEL_COOLDOWN,
            playerAnswered: false,
            opponentAnswered: false,
            result: null,
            duelsWon: 0,
            duelsLost: 0,
            totalPointsStolen: 0
        });
    }
}));
