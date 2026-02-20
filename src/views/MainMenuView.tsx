import { useGameStore } from '../store/gameStore';
import { Leaderboard } from '../components/Leaderboard';
import './MainMenuView.css';

interface MainMenuViewProps {
    onEnableTeamMode: () => void;
}

export function MainMenuView({ onEnableTeamMode }: MainMenuViewProps) {
    const isDemoMode = useGameStore(state => state.isDemoMode);

    return (
        <div className="menu-screen">
            <div
                className="menu-container"
                style={isDemoMode ? {
                    borderColor: '#00ff88',
                    boxShadow: '0 0 50px rgba(0, 255, 136, 0.3)'
                } : {}}
            >
                <h1
                    className="game-title"
                    style={isDemoMode ? {
                        background: 'linear-gradient(135deg, #00ff88, #00b8ff)',
                        WebkitBackgroundClip: 'text'
                    } : {}}
                >
                    {isDemoMode ? '⚡ ADMIN TRIVIA ⚡' : '🔥 Blaze Trivia Arena 🔥'}
                </h1>
                <p className="game-subtitle">
                    {isDemoMode
                        ? 'ADMIN MODE: Play with Original Questions'
                        : 'Answer questions, build your streak, and risk it all!'}
                </p>
                <button
                    className="start-button"
                    onClick={onEnableTeamMode}
                    style={isDemoMode ? {
                        background: 'linear-gradient(135deg, #00ff88, #00b8ff)',
                        padding: '1.5rem 2rem'
                    } : {
                        background: 'linear-gradient(135deg, #FFD700, #FF6347)'
                    }}
                >
                    🏆 TEAM BATTLE MODE 🏆
                </button>
                <div className="game-rules">
                    <h3>To Play:</h3>
                    <ul>
                        <li>Answer trivia questions correctly to build your streak</li>
                        <li>Build combos for 2x, 3x, 4x multipliers!</li>
                        <li>Collect Power-Ups to attack opponents!</li>
                        <li>Challenge players to 1v1 Duels!</li>
                        <li>Unlock achievements and climb the leaderboard!</li>
                    </ul>
                </div>

                {/* Leaderboard */}
                <Leaderboard />
            </div>
        </div>
    );
}
