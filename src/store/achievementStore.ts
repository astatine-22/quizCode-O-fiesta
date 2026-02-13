import { create } from 'zustand';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
}

interface AchievementState {
    achievements: Achievement[];
    initializeAchievements: () => void;
    unlockAchievement: (id: string) => boolean;
    getUnlockedCount: () => number;
    checkAndUnlock: (id: string) => Achievement | null;
}

const defaultAchievements: Achievement[] = [
    {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Answer your first question correctly',
        icon: '🎯',
        unlocked: false
    },
    {
        id: 'on_fire',
        name: 'On Fire',
        description: 'Reach a 5 streak',
        icon: '🔥',
        unlocked: false
    },
    {
        id: 'lightning_round',
        name: 'Lightning Round',
        description: 'Answer a question in under 5 seconds',
        icon: '⚡',
        unlocked: false
    },
    {
        id: 'risk_taker',
        name: 'Risk Taker',
        description: 'Win any gamble',
        icon: '🎲',
        unlocked: false
    },
    {
        id: 'high_roller',
        name: 'High Roller',
        description: 'Win 3 AllIn gambles',
        icon: '💎',
        unlocked: false
    },
    {
        id: 'perfect_10',
        name: 'Perfect 10',
        description: 'Answer 10 questions correctly in a row',
        icon: '🏆',
        unlocked: false
    },
    {
        id: 'genius',
        name: 'Genius',
        description: 'Achieve 100% accuracy with 10+ questions',
        icon: '🧠',
        unlocked: false
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete the game in under 3 minutes',
        icon: '🚀',
        unlocked: false
    }
];

export const useAchievementStore = create<AchievementState>((set, get) => ({
    achievements: [],

    initializeAchievements: () => {
        const stored = localStorage.getItem('achievements');
        if (stored) {
            set({ achievements: JSON.parse(stored) });
        } else {
            set({ achievements: defaultAchievements });
            localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
        }
    },

    unlockAchievement: (id: string) => {
        const { achievements } = get();
        const achievement = achievements.find(a => a.id === id);

        if (!achievement || achievement.unlocked) {
            return false;
        }

        const updated = achievements.map(a =>
            a.id === id
                ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
                : a
        );

        set({ achievements: updated });
        localStorage.setItem('achievements', JSON.stringify(updated));

        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
        return true;
    },

    getUnlockedCount: () => {
        return get().achievements.filter(a => a.unlocked).length;
    },

    checkAndUnlock: (id: string) => {
        const unlocked = get().unlockAchievement(id);
        if (unlocked) {
            return get().achievements.find(a => a.id === id) || null;
        }
        return null;
    }
}));
