import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamStore, type TeamName } from '../store/teamStore';
import { useGameStore } from '../store/gameStore';
import { createGameSession, joinGameSession } from '../utils/firebaseSync';
import './TeamSelection.css';

interface TeamSelectionProps {
    onTeamSelected: () => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected }) => {
    const { isDemoMode } = useGameStore();
    const { setTeam, setGameSession, enableTeamMode } = useTeamStore();

    const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
    const [selectedTeam, setSelectedTeam] = useState<TeamName>(null);
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const teams: { name: TeamName; label: string; color: string; emoji: string }[] = isDemoMode
        ? [
            { name: 'Admin1', label: 'Admin 1', color: '#00ff88', emoji: '👨‍💼' },
            { name: 'Admin2', label: 'Admin 2', color: '#00b8ff', emoji: '👩‍💼' }
        ]
        : [
            { name: 'FY_BSc', label: 'FY BSc', color: '#FFD700', emoji: '🎓' },
            { name: 'SY_BSc', label: 'SY BSc', color: '#FF6347', emoji: '📚' }
        ];

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleCreateRoom = async () => {
        if (!selectedTeam) {
            alert('Please select a team!');
            return;
        }

        const name = playerName.trim() || `Player_${Date.now().toString().slice(-4)}`;
        setIsProcessing(true);

        try {
            const gameMode = isDemoMode ? 'admin' : 'user';
            const newRoomCode = generateRoomCode();

            // Create session with room code as ID
            const sessionId = `room_${newRoomCode}`;
            await createGameSession(gameMode, sessionId);

            // Join the session
            await joinGameSession(sessionId, selectedTeam, name, gameMode);

            // Update team store
            setTeam(selectedTeam, name);
            setGameSession(sessionId);
            enableTeamMode();

            // Show room code to user
            setRoomCode(newRoomCode);

            console.log(`[TeamSelection] Created room ${newRoomCode} for ${selectedTeam}`);

            // Navigate to waiting room after showing code
            setTimeout(() => {
                onTeamSelected();
            }, 2000);

        } catch (error) {
            console.error('[TeamSelection] Error creating room:', error);
            alert('Failed to create room. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!selectedTeam) {
            alert('Please select a team!');
            return;
        }

        if (!roomCode.trim()) {
            alert('Please enter a room code!');
            return;
        }

        const name = playerName.trim() || `Player_${Date.now().toString().slice(-4)}`;
        setIsProcessing(true);

        try {
            const gameMode = isDemoMode ? 'admin' : 'user';
            const sessionId = `room_${roomCode.toUpperCase()}`;

            // Join the session
            await joinGameSession(sessionId, selectedTeam, name, gameMode);

            // Update team store
            setTeam(selectedTeam, name);
            setGameSession(sessionId);
            enableTeamMode();

            console.log(`[TeamSelection] Joined room ${roomCode} as ${selectedTeam}`);

            // Navigate to waiting room
            onTeamSelected();

        } catch (error) {
            console.error('[TeamSelection] Error joining room:', error);
            alert('Failed to join room. Check the room code and try again.');
            setIsProcessing(false);
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
                <AnimatePresence mode="wait">
                    {/* Main Menu */}
                    {mode === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h1 className="team-selection-title">
                                {isDemoMode ? '⚡ Admin Battle Mode ⚡' : '🏆 Team Battle Mode 🏆'}
                            </h1>

                            <p className="team-selection-subtitle">
                                Choose how to start your battle!
                            </p>

                            <div className="room-options">
                                <motion.button
                                    className="room-option-button create"
                                    onClick={() => setMode('create')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="option-icon">🎮</div>
                                    <div className="option-title">Create Room</div>
                                    <div className="option-desc">Start a new game session</div>
                                </motion.button>

                                <motion.button
                                    className="room-option-button join"
                                    onClick={() => setMode('join')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="option-icon">🚪</div>
                                    <div className="option-title">Join Room</div>
                                    <div className="option-desc">Enter a room code</div>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Create Room Flow */}
                    {mode === 'create' && (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <button className="back-button" onClick={() => setMode('menu')}>
                                ← Back
                            </button>

                            <h1 className="team-selection-title">Create Room</h1>

                            {roomCode ? (
                                <div className="room-code-display">
                                    <div className="room-code-label">Your Room Code:</div>
                                    <div className="room-code-value">{roomCode}</div>
                                    <div className="room-code-hint">Share this code with your opponent!</div>
                                </div>
                            ) : (
                                <>
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
                                        onClick={handleCreateRoom}
                                        disabled={!selectedTeam || isProcessing}
                                        whileHover={{ scale: selectedTeam ? 1.05 : 1 }}
                                        whileTap={{ scale: selectedTeam ? 0.95 : 1 }}
                                        style={{
                                            background: selectedTeam
                                                ? `linear-gradient(135deg, ${teams.find(t => t.name === selectedTeam)?.color}, #fff)`
                                                : '#444'
                                        }}
                                    >
                                        {isProcessing ? 'Creating Room...' : 'Create Room 🎮'}
                                    </motion.button>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Join Room Flow */}
                    {mode === 'join' && (
                        <motion.div
                            key="join"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <button className="back-button" onClick={() => setMode('menu')}>
                                ← Back
                            </button>

                            <h1 className="team-selection-title">Join Room</h1>

                            <div className="room-code-input-section">
                                <label htmlFor="roomCode">Enter Room Code</label>
                                <input
                                    id="roomCode"
                                    type="text"
                                    placeholder="e.g. ABC123"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    className="room-code-input"
                                />
                            </div>

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
                                <label htmlFor="playerNameJoin">Your Name (Optional)</label>
                                <input
                                    id="playerNameJoin"
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
                                onClick={handleJoinRoom}
                                disabled={!selectedTeam || !roomCode.trim() || isProcessing}
                                whileHover={{ scale: (selectedTeam && roomCode.trim()) ? 1.05 : 1 }}
                                whileTap={{ scale: (selectedTeam && roomCode.trim()) ? 0.95 : 1 }}
                                style={{
                                    background: (selectedTeam && roomCode.trim())
                                        ? `linear-gradient(135deg, ${teams.find(t => t.name === selectedTeam)?.color}, #fff)`
                                        : '#444'
                                }}
                            >
                                {isProcessing ? 'Joining...' : 'Join Room 🚪'}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
