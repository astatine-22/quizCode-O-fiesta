// Testable probability engine with logging
export interface GambleResult {
    won: boolean;
    roll: number;
    threshold: number;
    type: 'double' | 'triple' | 'allin';
}

/**
 * DoubleOrNothing - 50% chance
 * Roll 0-99, win if < 50
 */
export function rollDoubleOrNothing(): GambleResult {
    const roll = Math.floor(Math.random() * 100);
    const threshold = 50;
    const won = roll < threshold;

    console.log(`[DoubleOrNothing] Rolled ${roll}, needed <${threshold}, ${won ? 'WIN' : 'LOSE'}`);

    return { won, roll, threshold, type: 'double' };
}

/**
 * TripleTrouble - 33.33% chance
 * Roll 0-99, win if < 33
 */
export function rollTripleTrouble(): GambleResult {
    const roll = Math.floor(Math.random() * 100);
    const threshold = 33;
    const won = roll < threshold;

    console.log(`[TripleTrouble] Rolled ${roll}, needed <${threshold}, ${won ? 'WIN' : 'LOSE'}`);

    return { won, roll, threshold, type: 'triple' };
}

/**
 * AllIn - 45% chance (slight house edge)
 * Roll 0-99, win if < 45
 */
export function rollAllIn(): GambleResult {
    const roll = Math.floor(Math.random() * 100);
    const threshold = 45;
    const won = roll < threshold;

    console.log(`[AllIn] Rolled ${roll}, needed <${threshold}, ${won ? 'WIN' : 'LOSE'}`);

    return { won, roll, threshold, type: 'allin' };
}

/**
 * Test probability distribution
 * Run N trials and return win rate
 */
export function testProbability(
    gambleType: 'double' | 'triple' | 'allin',
    trials: number = 20
): { wins: number; losses: number; winRate: number } {
    let wins = 0;

    console.log(`\n=== Testing ${gambleType} (${trials} trials) ===`);

    for (let i = 0; i < trials; i++) {
        let result: GambleResult;

        switch (gambleType) {
            case 'double':
                result = rollDoubleOrNothing();
                break;
            case 'triple':
                result = rollTripleTrouble();
                break;
            case 'allin':
                result = rollAllIn();
                break;
        }

        if (result.won) wins++;
    }

    const losses = trials - wins;
    const winRate = (wins / trials) * 100;

    console.log(`\n=== Results: ${wins} wins, ${losses} losses (${winRate.toFixed(1)}% win rate) ===\n`);

    return { wins, losses, winRate };
}
