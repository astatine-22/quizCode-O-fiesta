import { GambleArena } from '../components/GambleArena';
import { ScoreCounter } from '../components/ScoreCounter';
import { ComboDisplay } from '../components/ComboDisplay';
import { PowerUpInventory } from '../components/PowerUpInventory';
import { useGameStore } from '../store/gameStore';
import type { GambleType } from '../config/gameConfig';

interface GambleViewProps {
    currentPoints: number;
    onBank: () => void;
    onGamble: (type: GambleType, result: boolean) => void;
}

export function GambleView({ currentPoints, onBank, onGamble }: GambleViewProps) {
    const streak = useGameStore(state => state.streak);

    return (
        <>
            {/* Score Counter */}
            <ScoreCounter />

            {/* Combo Display */}
            <ComboDisplay />

            {/* Power Up Inventory */}
            <PowerUpInventory />

            {/* Gamble Arena */}
            <GambleArena
                currentPoints={currentPoints}
                streakLevel={streak}
                onBank={onBank}
                onGamble={onGamble}
            />
        </>
    );
}
