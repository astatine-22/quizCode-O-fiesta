import { ref, set, get, update } from 'firebase/database';
import { database } from '../config/firebase';
import type { TeamName, TeamData } from '../store/teamStore';

/**
 * Creates a new game session in Firebase
 * @param mode 'user' or 'admin'
 * @returns sessionId
 */
export const createGameSession = async (mode: 'user' | 'admin'): Promise<string> => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionRef = ref(database, `games/${mode}/${sessionId}`);

    await set(sessionRef, {
        status: 'waiting',
        createdAt: Date.now(),
        teams: {}
    });

    console.log(`[Firebase] Created ${mode} game session: ${sessionId}`);
    return sessionId;
};

/**
 * Joins an existing game session or creates one if it doesn't exist
 * @param sessionId 
 * @param teamName 
 * @param playerName 
 * @param mode 
 */
export const joinGameSession = async (
    sessionId: string,
    teamName: TeamName,
    playerName: string,
    mode: 'user' | 'admin'
): Promise<void> => {
    if (!teamName) return;

    const teamRef = ref(database, `games/${mode}/${sessionId}/teams/${teamName}`);

    // Check if team already exists
    const snapshot = await get(teamRef);
    const existingData = snapshot.val();

    if (existingData) {
        // Add player to existing team
        const updatedMembers = [...(existingData.members || []), playerName];
        await update(teamRef, {
            members: updatedMembers,
            timestamp: Date.now()
        });
        console.log(`[Firebase] ${playerName} joined ${teamName}`);
    } else {
        // Create new team entry
        await set(teamRef, {
            score: 0,
            streak: 0,
            lives: 3,
            currentQuestion: 0,
            ready: false,
            members: [playerName],
            powerUps: {
                pointSteal: 0,
                freeze: 0,
                timePressure: 0,
                lifeDrain: 0,
                scramble: 0
            },
            timestamp: Date.now()
        });
        console.log(`[Firebase] Created team ${teamName} with ${playerName}`);
    }
};

/**
 * Updates game session status
 * @param sessionId 
 * @param status 
 * @param mode 
 */
export const updateGameStatus = async (
    sessionId: string,
    status: 'waiting' | 'playing' | 'finished',
    mode: 'user' | 'admin'
): Promise<void> => {
    const statusRef = ref(database, `games/${mode}/${sessionId}/status`);
    await set(statusRef, status);
    console.log(`[Firebase] Game ${sessionId} status: ${status}`);
};

/**
 * Checks if both teams are ready
 * @param sessionId 
 * @param mode 
 * @returns boolean
 */
export const checkBothTeamsReady = async (
    sessionId: string,
    mode: 'user' | 'admin'
): Promise<boolean> => {
    const teamsRef = ref(database, `games/${mode}/${sessionId}/teams`);
    const snapshot = await get(teamsRef);
    const teams = snapshot.val();

    if (!teams) return false;

    const teamNames = Object.keys(teams);
    if (teamNames.length < 2) return false;

    return teamNames.every(teamName => teams[teamName]?.ready === true);
};

/**
 * Sends a notification to Firebase
 * @param sessionId 
 * @param notification 
 * @param mode 
 */
export const sendNotification = async (
    sessionId: string,
    notification: {
        type: string;
        team: TeamName;
        message: string;
    },
    mode: 'user' | 'admin'
): Promise<void> => {
    const notifId = `notif_${Date.now()}`;
    const notifRef = ref(database, `games/${mode}/${sessionId}/notifications/${notifId}`);

    await set(notifRef, {
        ...notification,
        timestamp: Date.now()
    });

    console.log(`[Firebase] Notification sent:`, notification.message);
};

/**
 * Steals points from opponent team
 * @param sessionId 
 * @param myTeam 
 * @param opponentTeam 
 * @param percentage 
 * @param mode 
 */
export const stealPointsFromTeam = async (
    sessionId: string,
    myTeam: TeamName,
    opponentTeam: TeamName,
    percentage: number,
    mode: 'user' | 'admin'
): Promise<number> => {
    if (!myTeam || !opponentTeam) return 0;

    const teamsRef = ref(database, `games/${mode}/${sessionId}/teams`);
    const snapshot = await get(teamsRef);
    const teams = snapshot.val();

    if (!teams || !teams[opponentTeam]) return 0;

    const opponentScore = teams[opponentTeam].score || 0;
    const stolenPoints = Math.floor(opponentScore * percentage);

    // Update both teams
    await update(ref(database, `games/${mode}/${sessionId}/teams/${myTeam}`), {
        score: (teams[myTeam]?.score || 0) + stolenPoints,
        timestamp: Date.now()
    });

    await update(ref(database, `games/${mode}/${sessionId}/teams/${opponentTeam}`), {
        score: Math.max(0, opponentScore - stolenPoints),
        timestamp: Date.now()
    });

    // Send notification
    await sendNotification(sessionId, {
        type: 'points_stolen',
        team: myTeam,
        message: `⚡ ${myTeam} stole ${stolenPoints} points from ${opponentTeam}!`
    }, mode);

    console.log(`[Firebase] ${myTeam} stole ${stolenPoints} points from ${opponentTeam}`);
    return stolenPoints;
};
