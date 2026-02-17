/**
 * Game Configuration
 * Centralized configuration for all game constants and magic numbers
 */

export const GAME_CONFIG = {
    // Player Configuration
    INITIAL_LIVES: 5,
    INITIAL_SCORE: 0,
    INITIAL_STREAK: 0,

    // Points Configuration
    BASE_POINTS: 100,
    STREAK_BONUS_PER_LEVEL: 10,

    // Speed Bonus Configuration
    SPEED_BONUS: {
        VERY_FAST_THRESHOLD: 3, // seconds
        VERY_FAST_POINTS: 100,
        FAST_THRESHOLD: 5, // seconds
        FAST_POINTS: 50,
    },

    // Combo System
    COMBO: {
        LEVEL_2_THRESHOLD: 2,
        LEVEL_2_MULTIPLIER: 2,
        LEVEL_3_THRESHOLD: 3,
        LEVEL_3_MULTIPLIER: 3,
        LEVEL_4_THRESHOLD: 5,
        LEVEL_4_MULTIPLIER: 4,
    },

    // Gamble Multipliers
    GAMBLE_MULTIPLIERS: {
        DOUBLE: 2,
        TRIPLE: 4,
        ALLIN: 6,
    },

    // Phase Transition Timeouts (milliseconds)
    TRANSITIONS: {
        CORRECT_ANSWER_TO_GAMBLE: 1000,
        WRONG_ANSWER_TO_NEXT: 1500,
        GAMBLE_RESULT_TO_NEXT: 500,
    },

    // Achievement Milestones
    ACHIEVEMENTS: {
        POWER_UP_UNLOCK_STREAK: 3,
        HIGH_ROLLER_ALLIN_WINS: 3,
    },

    // Power-Up Drop Rates
    POWER_UP_DROP_RATES: {
        LIFE_DRAIN_CHANCE: 0.1, // 10% chance
    },

    // Category Bonus
    CATEGORY_PERFECT_BONUS: 200,

    // Time Attack Mode
    TIME_ATTACK: {
        INITIAL_TIME: 180, // 3 minutes in seconds
    },
} as const;

// Type exports for better type safety
export type GambleType = 'double' | 'triple' | 'allin';
export type SpeedBonusTier = 'very_fast' | 'fast' | 'none';

/**
 * Calculate speed bonus based on answer time
 */
export function calculateSpeedBonus(answerTime: number): {
    points: number;
    tier: SpeedBonusTier;
} {
    if (answerTime < GAME_CONFIG.SPEED_BONUS.VERY_FAST_THRESHOLD) {
        return {
            points: GAME_CONFIG.SPEED_BONUS.VERY_FAST_POINTS,
            tier: 'very_fast',
        };
    } else if (answerTime < GAME_CONFIG.SPEED_BONUS.FAST_THRESHOLD) {
        return {
            points: GAME_CONFIG.SPEED_BONUS.FAST_POINTS,
            tier: 'fast',
        };
    }
    return { points: 0, tier: 'none' };
}

/**
 * Get gamble multiplier by type
 */
export function getGambleMultiplier(type: GambleType): number {
    switch (type) {
        case 'double':
            return GAME_CONFIG.GAMBLE_MULTIPLIERS.DOUBLE;
        case 'triple':
            return GAME_CONFIG.GAMBLE_MULTIPLIERS.TRIPLE;
        case 'allin':
            return GAME_CONFIG.GAMBLE_MULTIPLIERS.ALLIN;
    }
}

/**
 * Calculate combo multiplier based on combo count
 */
export function calculateComboMultiplier(comboCount: number): number {
    if (comboCount >= GAME_CONFIG.COMBO.LEVEL_4_THRESHOLD) {
        return GAME_CONFIG.COMBO.LEVEL_4_MULTIPLIER;
    } else if (comboCount >= GAME_CONFIG.COMBO.LEVEL_3_THRESHOLD) {
        return GAME_CONFIG.COMBO.LEVEL_3_MULTIPLIER;
    } else if (comboCount >= GAME_CONFIG.COMBO.LEVEL_2_THRESHOLD) {
        return GAME_CONFIG.COMBO.LEVEL_2_MULTIPLIER;
    }
    return 1;
}
