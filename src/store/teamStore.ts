import { create } from 'zustand';
import { ref, set, onValue, off, update, get } from 'firebase/database';
import { database } from '../config/firebase';

export type TeamName = 'FY_BSc' | 'SY_BSc' | 'Admin1' | 'Admin2' | null;

export interface TeamData {
    score: number;
    streak: number;
    lives: number;
    currentQuestion: number;
    ready: boolean;
    members: string[];
    powerUps: {
        pointSteal: number;
        freeze: number;
        timePressure: number;
        lifeDrain: number;
        scramble: number;
    };
    lastAction?: string;
    timestamp?: number;
}

export interface Notification {
    id: string;
    type: 'streak_alert' | 'power_up_used' | 'answer_correct' | 'answer_wrong' | 'points_stolen';
    team: TeamName;
    message: string;
    timestamp: number;
}

interface TeamState {
    // Team identity
    myTeam: TeamName;
    opponentTeam: TeamName;
    playerName: string;
    gameSessionId: string | null;
    isTeamMode: boolean;

    // Team data
    myTeamData: TeamData | null;
    opponentTeamData: TeamData | null;

    // Notifications
    notifications: Notification[];

    // Actions
    setTeam: (team: TeamName, playerName: string) => void;
    setGameSession: (sessionId: string) => void;
    enableTeamMode: () => void;
    disableTeamMode: () => void;

    // Firebase sync
    syncMyTeamData: (data: Partial<TeamData>) => Promise<void>;
    setReady: (ready: boolean) => Promise<void>;
    listenToOpponent: () => void;
    stopListeningToOpponent: () => void;

    // Notifications
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    clearNotifications: () => void;

    // Reset
    resetTeamStore: () => void;
}

const getOpponentTeam = (myTeam: TeamName): TeamName => {
    if (myTeam === 'FY_BSc') return 'SY_BSc';
    if (myTeam === 'SY_BSc') return 'FY_BSc';
    if (myTeam === 'Admin1') return 'Admin2';
    if (myTeam === 'Admin2') return 'Admin1';
    return null;
};

const initialTeamData: TeamData = {
    score: 0,
    streak: 0,
    lives: 3,
    currentQuestion: 0,
    ready: false,
    members: [],
    powerUps: {
        pointSteal: 0,
        freeze: 0,
        timePressure: 0,
        lifeDrain: 0,
        scramble: 0
    }
};

export const useTeamStore = create<TeamState>((set, get) => ({
    // Initial state
    myTeam: null,
    opponentTeam: null,
    playerName: '',
    gameSessionId: null,
    isTeamMode: false,
    myTeamData: null,
    opponentTeamData: null,
    notifications: [],

    setTeam: (team, playerName) => {
        const opponent = getOpponentTeam(team);
        set({
            myTeam: team,
            opponentTeam: opponent,
            playerName,
            myTeamData: { ...initialTeamData, members: [playerName] }
        });

        // Store in localStorage for persistence
        localStorage.setItem('selectedTeam', team || '');
        localStorage.setItem('playerName', playerName);

        console.log(`[Team] Selected: ${team}, Opponent: ${opponent}`);
    },

    setGameSession: (sessionId) => {
        set({ gameSessionId: sessionId });
        localStorage.setItem('gameSessionId', sessionId);
        console.log(`[Team] Game session: ${sessionId}`);
    },

    enableTeamMode: () => {
        set({ isTeamMode: true });
        console.log('[Team] Team mode enabled');
    },

    disableTeamMode: () => {
        set({ isTeamMode: false });
        console.log('[Team] Team mode disabled');
    },

    syncMyTeamData: async (data) => {
        const { myTeam, gameSessionId, myTeamData } = get();

        if (!myTeam || !gameSessionId) {
            console.warn('[Team] Cannot sync: No team or session');
            return;
        }

        const mode = myTeam.startsWith('Admin') ? 'admin' : 'user';
        const teamRef = ref(database, `games/${mode}/${gameSessionId}/teams/${myTeam}`);

        const updatedData = {
            ...myTeamData,
            ...data,
            timestamp: Date.now()
        };

        try {
            await update(teamRef, updatedData);
            set({ myTeamData: updatedData as TeamData });
            console.log(`[Team] Synced data for ${myTeam}:`, data);
        } catch (error) {
            console.error('[Team] Sync error:', error);
        }
    },

    setReady: async (ready) => {
        const { syncMyTeamData } = get();
        await syncMyTeamData({ ready });
    },

    listenToOpponent: () => {
        const { opponentTeam, gameSessionId, myTeam } = get();

        if (!opponentTeam || !gameSessionId) {
            console.warn('[Team] Cannot listen: No opponent or session');
            return;
        }

        const mode = myTeam?.startsWith('Admin') ? 'admin' : 'user';
        const opponentRef = ref(database, `games/${mode}/${gameSessionId}/teams/${opponentTeam}`);

        onValue(opponentRef, (snapshot) => {
            const data = snapshot.val() as TeamData | null;

            if (data) {
                const prevData = get().opponentTeamData;
                set({ opponentTeamData: data });

                // Trigger notifications for significant events
                if (prevData) {
                    // Streak milestone
                    if (data.streak >= 5 && data.streak > prevData.streak) {
                        get().addNotification({
                            type: 'streak_alert',
                            team: opponentTeam,
                            message: `🔥 ${opponentTeam} is on a ${data.streak}-streak!`
                        });
                    }

                    // Score change (correct answer)
                    if (data.score > prevData.score) {
                        get().addNotification({
                            type: 'answer_correct',
                            team: opponentTeam,
                            message: `✅ ${opponentTeam} answered correctly! +${data.score - prevData.score} pts`
                        });
                    }
                }

                console.log(`[Team] Opponent ${opponentTeam} updated:`, data);
            }
        });

        console.log(`[Team] Listening to ${opponentTeam}`);
    },

    stopListeningToOpponent: () => {
        const { opponentTeam, gameSessionId, myTeam } = get();

        if (!opponentTeam || !gameSessionId) return;

        const mode = myTeam?.startsWith('Admin') ? 'admin' : 'user';
        const opponentRef = ref(database, `games/${mode}/${gameSessionId}/teams/${opponentTeam}`);
        off(opponentRef);

        console.log(`[Team] Stopped listening to ${opponentTeam}`);
    },

    addNotification: (notification) => {
        const newNotif: Notification = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        set((state) => ({
            notifications: [...state.notifications, newNotif]
        }));

        // Auto-remove after 5 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter(n => n.id !== newNotif.id)
            }));
        }, 5000);
    },

    clearNotifications: () => {
        set({ notifications: [] });
    },

    resetTeamStore: () => {
        get().stopListeningToOpponent();
        set({
            myTeam: null,
            opponentTeam: null,
            playerName: '',
            gameSessionId: null,
            isTeamMode: false,
            myTeamData: null,
            opponentTeamData: null,
            notifications: []
        });
        localStorage.removeItem('selectedTeam');
        localStorage.removeItem('playerName');
        localStorage.removeItem('gameSessionId');
        console.log('[Team] Store reset');
    }
}));
