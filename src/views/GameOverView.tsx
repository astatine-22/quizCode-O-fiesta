import { GameOver } from '../components/GameOver';
import { useGameStore } from '../store/gameStore';

export function GameOverView() {
    const score = useGameStore(state => state.score);
    const maxStreak = useGameStore(state => state.maxStreak);
    const sessionHistory = useGameStore(state => state.sessionHistory);

    const questionsAnswered = sessionHistory.length;
    const correctAnswers = sessionHistory.filter(h => h.correct).length;

    return (
        <GameOver
            finalScore={score}
            maxStreak={maxStreak}
            questionsAnswered={questionsAnswered}
            correctAnswers={correctAnswers}
        />
    );
}
