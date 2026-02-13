import { create } from 'zustand';

export interface LeaderboardEntry {
    id: string;
    playerName: string;
    score: number;
    maxStreak: number;
    accuracy: number;
    date: string;
}

interface LeaderboardState {
    entries: LeaderboardEntry[];
    adminEntries: LeaderboardEntry[];
    loadLeaderboard: () => void;
    addEntry: (entry: Omit<LeaderboardEntry, 'id'>, isAdmin?: boolean) => void;
    isHighScore: (score: number, isAdmin?: boolean) => boolean;
    getTopEntries: (count: number, isAdmin?: boolean) => LeaderboardEntry[];
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
    entries: [],
    adminEntries: [],

    loadLeaderboard: () => {
        const stored = localStorage.getItem('leaderboard');
        if (stored) {
            set({ entries: JSON.parse(stored) });
        }

        const storedAdmin = localStorage.getItem('adminLeaderboard');
        if (storedAdmin) {
            set({ adminEntries: JSON.parse(storedAdmin) });
        }
    },

    addEntry: (entry, isAdmin = false) => {
        const newEntry: LeaderboardEntry = {
            ...entry,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        const { entries, adminEntries } = get();
        const targetEntries = isAdmin ? adminEntries : entries;
        const storageKey = isAdmin ? 'adminLeaderboard' : 'leaderboard';

        const updated = [...targetEntries, newEntry]
            .sort((a, b) => {
                // Sort by score (descending), then by maxStreak (descending)
                if (b.score !== a.score) return b.score - a.score;
                return b.maxStreak - a.maxStreak;
            })
            .slice(0, 10); // Keep only top 10

        if (isAdmin) {
            set({ adminEntries: updated });
        } else {
            set({ entries: updated });
        }

        localStorage.setItem(storageKey, JSON.stringify(updated));

        console.log(`📊 New ${isAdmin ? 'ADMIN' : ''} leaderboard entry: ${entry.playerName} - ${entry.score} points`);
    },

    isHighScore: (score: number, isAdmin = false) => {
        const { entries, adminEntries } = get();
        const targetList = isAdmin ? adminEntries : entries;

        if (targetList.length < 10) return true;
        return score > targetList[targetList.length - 1].score;
    },

    getTopEntries: (count: number, isAdmin = false) => {
        const { entries, adminEntries } = get();
        return (isAdmin ? adminEntries : entries).slice(0, count);
    }
}));
