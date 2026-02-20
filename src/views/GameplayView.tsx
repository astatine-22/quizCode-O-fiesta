import { AnimatePresence } from 'framer-motion';
import { QuestionCard } from '../components/QuestionCard';
import { ScoreCounter } from '../components/ScoreCounter';
import { ComboDisplay } from '../components/ComboDisplay';
import { LiveNotifications } from '../components/LiveNotifications';
import { useGameStore } from '../store/gameStore';
import { useTeamStore } from '../store/teamStore';
import type { Question } from '../data/questions';

interface GameplayViewProps {
    currentQuestion: Question;
    questionIndex: number;
    onAnswerSelected: (answerIndex: number, isCorrect: boolean, answerTime: number) => void;
}

export function GameplayView({ currentQuestion, questionIndex, onAnswerSelected }: GameplayViewProps) {
    const streak = useGameStore(state => state.streak);
    const isTeamMode = useTeamStore(state => state.isTeamMode);

    return (
        <>
            {/* Team Mode UI Elements */}
            {isTeamMode && (
                <LiveNotifications />
            )}

            {/* Score Counter */}
            <ScoreCounter />

            {/* Combo Display */}
            <ComboDisplay />

            {/* Question Card */}
            <div className="game-container">
                <AnimatePresence mode="wait">
                    <QuestionCard
                        key={questionIndex}
                        question={currentQuestion}
                        streak={streak}
                        onAnswerSelected={onAnswerSelected}
                    />
                </AnimatePresence>
            </div>
        </>
    );
}
