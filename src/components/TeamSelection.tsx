import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTeamStore, type TeamName } from '../store/teamStore';
import { useGameStore } from '../store/gameStore';
import { getOrCreateActiveSession, joinGameSession } from '../utils/firebaseSync';
import './TeamSelection.css';

interface TeamSelectionProps {
    onTeamSelected: () => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected }) => {
    const { isDemoMode } = useGameStore();
    const { setTeam, setGameSession, enableTeamMode } = useTeamStore();

    const [selectedTeam, setSelectedTeam] = useState<TeamName>(null);
    const [playerName, setPlayerName] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const teams: { name: TeamName; label: string; color: string; emoji: string }[] = isDemoMode
        ? [
            { name: 'Admin1', label: 'Admin 1', color: '#00ff88', emoji: '👨‍💼' },
            { name: 'Admin2', label: 'Admin 2', color: '#00b8ff', emoji: '👩‍💼' }
        ]
        : [
            { name: 'FY_BSc', label: 'FY BSc', color: '#FFD700', emoji: '🎓' },
            { name: 'SY_BSc', label: 'SY BSc', color: '#FF6347', emoji: '📚' }
        ];

    const handleJoinGame = async () => {
        if (!selectedTeam) {
            alert('Please select a team!');
            return;
        }

        const name = playerName.trim() || `Player_${Date.now().toString().slice(-4)}`;
        setIsJoining(true);

        try {
            // Get or create shared session (all teams join the same session)
            const mode = isDemoMode ? 'admin' : 'user';
            const sessionId = await getOrCreateActiveSession(mode);

            // Join the session
            await joinGameSession(sessionId, selectedTeam, name, mode);

            // Update team store
            setTeam(selectedTeam, name);
            setGameSession(sessionId);
            enableTeamMode();

            // Navigate to waiting room
            onTeamSelected();

            console.log(`[TeamSelection] ${name} joined ${selectedTeam} in session ${sessionId}`);
        } catch (error) {
            console.error('[TeamSelection] Error joining game:', error);
            alert('Failed to join game. Please try again.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="team-selection-screen">
            <motion.div
                className="team-selection-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="team-selection-title">
                    {isDemoMode ? '⚡ Admin Battle Mode ⚡' : '🏆 Choose Your Team 🏆'}
                </h1>

                <p className="team-selection-subtitle">
                    {isDemoMode
                        ? 'Select your admin role to compete!'
                        : 'Two teams will compete in real-time!'}
                </p>

                <div className="teams-grid">
                    {teams.map((team) => (
                        <motion.div
                            key={team.name}
                            className={`team-card ${selectedTeam === team.name ? 'selected' : ''}`}
                            onClick={() => setSelectedTeam(team.name)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                borderColor: selectedTeam === team.name ? team.color : 'rgba(255,255,255,0.2)'
                            }}
                        >
                            <div className="team-emoji">{team.emoji}</div>
                            <div className="team-name" style={{ color: team.color }}>
                                {team.label}
                            </div>
                            {selectedTeam === team.name && (
                                <motion.div
                                    className="selected-indicator"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    ✓
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="player-name-section">
                    <label htmlFor="playerName">Your Name (Optional)</label>
                    <input
                        id="playerName"
                        type="text"
                        placeholder={`Team ${selectedTeam || '...'} Member`}
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={20}
                        className="player-name-input"
                    />
                </div>

                <motion.button
                    className="join-game-button"
                    onClick={handleJoinGame}
                    disabled={!selectedTeam || isJoining}
                    whileHover={{ scale: selectedTeam ? 1.05 : 1 }}
                    whileTap={{ scale: selectedTeam ? 0.95 : 1 }}
                    style={{
                        background: selectedTeam
                            ? `linear-gradient(135deg, ${teams.find(t => t.name === selectedTeam)?.color}, #fff)`
                            : '#444'
                    }}
                >
                    {isJoining ? 'Joining...' : 'Join Game 🚀'}
                </motion.button>

                <div className="team-info">
                    <p>💡 Both teams must join before the game starts!</p>
                </div>
            </motion.div>
        </div>
    );
};
