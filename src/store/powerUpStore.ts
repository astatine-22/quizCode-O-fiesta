import { create } from 'zustand';
import { useTeamStore } from './teamStore';
import { applyPowerUpEffect, drainLifeFromTeam, stealPointsFromTeam } from '../utils/firebaseSync';

export type PowerUpType = 'pointSteal' | 'freeze' | 'timePressure' | 'lifeDrain' | 'scramble';

export interface PowerUp {
    type: PowerUpType;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export interface ActiveEffect {
    type: PowerUpType;
    targetId?: string;
    duration: number; // in questions
    appliedAt: number; // timestamp
}

export interface PowerUpInventory {
    pointSteal: number;
    freeze: number;
    timePressure: number;
    lifeDrain: number;
    scramble: number;
}

interface PowerUpState {
    inventory: PowerUpInventory;
    activeEffects: ActiveEffect[];
    lastEarnedPowerUp: PowerUpType | null;

    // Power-up definitions
    powerUps: Record<PowerUpType, PowerUp>;

    // Actions
    earnPowerUp: (type: PowerUpType) => void;
    usePowerUp: (type: PowerUpType, targetId?: string) => Promise<boolean>;
    addActiveEffect: (effect: ActiveEffect) => void;
    removeActiveEffect: (type: PowerUpType) => void;
    decrementEffectDurations: () => void;
    hasActiveEffect: (type: PowerUpType) => boolean;
    getInventoryCount: (type: PowerUpType) => number;
    clearLastEarned: () => void;
    resetInventory: () => void;
}

export const usePowerUpStore = create<PowerUpState>((set, get) => ({
    inventory: {
        pointSteal: 0,
        freeze: 0,
        timePressure: 0,
        lifeDrain: 0,
        scramble: 0
    },

    activeEffects: [],
    lastEarnedPowerUp: null,

    powerUps: {
        pointSteal: {
            type: 'pointSteal',
            name: 'Point Steal',
            description: 'Steal 15% of points from the opponent team',
            icon: '⚡',
            color: '#FFD700'
        },
        freeze: {
            type: 'freeze',
            name: 'Freeze',
            description: 'Disable opponent team combo multiplier for 2 questions',
            icon: '❄️',
            color: '#00BFFF'
        },
        timePressure: {
            type: 'timePressure',
            name: 'Time Pressure',
            description: 'Reduce opponent answer time by 50% for next question',
            icon: '⏰',
            color: '#FF6347'
        },
        lifeDrain: {
            type: 'lifeDrain',
            name: 'Life Drain',
            description: 'Remove 1 life from opponent team',
            icon: '💀',
            color: '#8B008B'
        },
        scramble: {
            type: 'scramble',
            name: 'Scramble',
            description: 'Shuffle opponent answer options for next question',
            icon: '🌪️',
            color: '#FF8C00'
        }
    },

    earnPowerUp: (type) => set((state) => {
        console.log(`[PowerUp] Earned: ${type}`);
        return {
            inventory: {
                ...state.inventory,
                [type]: state.inventory[type] + 1
            },
            lastEarnedPowerUp: type
        };
    }),

    usePowerUp: async (type, targetId) => {
        const state = get();

        if (state.inventory[type] <= 0) {
            console.warn(`[PowerUp] Cannot use ${type}: none in inventory`);
            return false;
        }

        console.log(`[PowerUp] Used: ${type} on target ${targetId || 'opponent'}`);

        // Decrement inventory
        set({
            inventory: {
                ...state.inventory,
                [type]: state.inventory[type] - 1
            }
        });

        // Network attack in team mode
        const { gameSessionId, myTeam, opponentTeam, isTeamMode } = useTeamStore.getState();

        if (isTeamMode && gameSessionId && myTeam && opponentTeam) {
            const mode = myTeam.startsWith('Admin') ? 'admin' : 'user';

            try {
                switch (type) {
                    case 'lifeDrain':
                        await drainLifeFromTeam(gameSessionId, opponentTeam, mode);
                        console.log(`[PowerUp] Life drain attack sent to ${opponentTeam}`);
                        break;

                    case 'pointSteal':
                        const stolenPoints = await stealPointsFromTeam(
                            gameSessionId,
                            myTeam,
                            opponentTeam,
                            0.15, // 15%
                            mode
                        );
                        console.log(`[PowerUp] Stole ${stolenPoints} points from ${opponentTeam}`);
                        break;

                    case 'freeze':
                    case 'timePressure':
                    case 'scramble':
                        await applyPowerUpEffect(gameSessionId, opponentTeam, type, mode);
                        console.log(`[PowerUp] ${type} effect applied to ${opponentTeam}`);
                        break;
                }
            } catch (error) {
                console.error(`[PowerUp] Failed to apply ${type} to opponent:`, error);
                // Power-up was already consumed, but network attack failed
                // This is acceptable - the game continues
            }
        }

        return true;
    },

    addActiveEffect: (effect) => set((state) => {
        console.log(`[PowerUp] Active effect added: ${effect.type}`);
        return {
            activeEffects: [...state.activeEffects, effect]
        };
    }),

    removeActiveEffect: (type) => set((state) => ({
        activeEffects: state.activeEffects.filter(e => e.type !== type)
    })),

    decrementEffectDurations: () => set((state) => {
        const updated = state.activeEffects
            .map(effect => ({
                ...effect,
                duration: effect.duration - 1
            }))
            .filter(effect => effect.duration > 0);

        if (updated.length !== state.activeEffects.length) {
            console.log(`[PowerUp] Effects expired, remaining: ${updated.length}`);
        }

        return { activeEffects: updated };
    }),

    hasActiveEffect: (type) => {
        return get().activeEffects.some(e => e.type === type);
    },

    getInventoryCount: (type) => {
        return get().inventory[type];
    },

    clearLastEarned: () => set({ lastEarnedPowerUp: null }),

    resetInventory: () => set({
        inventory: {
            pointSteal: 0,
            freeze: 0,
            timePressure: 0,
            lifeDrain: 0,
            scramble: 0
        },
        activeEffects: [],
        lastEarnedPowerUp: null
    })
}));
