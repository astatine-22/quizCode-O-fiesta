// Sample trivia questions for Blaze Trivia Arena
export interface Question {
    id: number;
    text: string;
    answers: string[];
    correctIndex: number;
    category: string;
}

// Demo/Admin Questions (Original Set)
export const adminQuestions: Question[] = [
    // General Knowledge
    {
        id: 1,
        text: "What is the tallest mountain in the world?",
        answers: ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"],
        correctIndex: 1,
        category: "General Knowledge"
    },
    {
        id: 2,
        text: "Which planet is closest to the Sun?",
        answers: ["Venus", "Mars", "Mercury", "Earth"],
        correctIndex: 2,
        category: "General Knowledge"
    },
    {
        id: 3,
        text: "What is the largest organ in the human body?",
        answers: ["Heart", "Brain", "Liver", "Skin"],
        correctIndex: 3,
        category: "General Knowledge"
    },
    {
        id: 4,
        text: "How many bones are in the adult human body?",
        answers: ["186", "206", "226", "246"],
        correctIndex: 1,
        category: "General Knowledge"
    },
    {
        id: 5,
        text: "What is the speed of light in vacuum?",
        answers: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "99,792 km/s"],
        correctIndex: 0,
        category: "General Knowledge"
    },

    // Current Affairs (2025-2026)
    {
        id: 6,
        text: "Which country hosted the 2024 Summer Olympics?",
        answers: ["Japan", "France", "USA", "Australia"],
        correctIndex: 1,
        category: "Current Affairs"
    },
    {
        id: 7,
        text: "What is the name of the AI chatbot released by OpenAI in 2022?",
        answers: ["GPT-3", "ChatGPT", "DALL-E", "Codex"],
        correctIndex: 1,
        category: "Current Affairs"
    },
    {
        id: 8,
        text: "Which company became the first to reach a $3 trillion market cap in 2024?",
        answers: ["Microsoft", "Google", "Apple", "Amazon"],
        correctIndex: 2,
        category: "Current Affairs"
    },
    {
        id: 9,
        text: "What is the name of NASA's mission to return humans to the Moon?",
        answers: ["Apollo", "Artemis", "Orion", "Gateway"],
        correctIndex: 1,
        category: "Current Affairs"
    },
    {
        id: 10,
        text: "Which social media platform was rebranded to 'X' in 2023?",
        answers: ["Facebook", "Instagram", "Twitter", "TikTok"],
        correctIndex: 2,
        category: "Current Affairs"
    },

    // Programming
    {
        id: 11,
        text: "What does 'HTML' stand for?",
        answers: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
        correctIndex: 0,
        category: "Programming"
    },
    {
        id: 12,
        text: "Which programming language is known as the 'language of the web'?",
        answers: ["Python", "Java", "JavaScript", "C++"],
        correctIndex: 2,
        category: "Programming"
    },
    {
        id: 13,
        text: "What does 'API' stand for in programming?",
        answers: ["Application Programming Interface", "Advanced Programming Integration", "Automated Program Interaction", "Application Process Integration"],
        correctIndex: 0,
        category: "Programming"
    },
    {
        id: 14,
        text: "Which of these is NOT a programming paradigm?",
        answers: ["Object-Oriented", "Functional", "Procedural", "Sequential"],
        correctIndex: 3,
        category: "Programming"
    },
    {
        id: 15,
        text: "What is the time complexity of binary search?",
        answers: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctIndex: 1,
        category: "Programming"
    },

    // Computer / Technology
    {
        id: 16,
        text: "What does 'CPU' stand for?",
        answers: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"],
        correctIndex: 0,
        category: "Computer/Technology"
    },
    {
        id: 17,
        text: "Which company developed the Android operating system?",
        answers: ["Apple", "Microsoft", "Google", "Samsung"],
        correctIndex: 2,
        category: "Computer/Technology"
    },
    {
        id: 18,
        text: "What does 'RAM' stand for?",
        answers: ["Random Access Memory", "Read Access Memory", "Rapid Application Memory", "Remote Access Module"],
        correctIndex: 0,
        category: "Computer/Technology"
    },
    {
        id: 19,
        text: "Which protocol is used to transfer web pages?",
        answers: ["FTP", "SMTP", "HTTP", "SSH"],
        correctIndex: 2,
        category: "Computer/Technology"
    },
    {
        id: 20,
        text: "What is the binary representation of the decimal number 10?",
        answers: ["1010", "1100", "1001", "1110"],
        correctIndex: 0,
        category: "Computer/Technology"
    }
];

// User Questions (New Set)
export const userQuestions: Question[] = [
    // --- COMPUTER & CODING ---
    {
        id: 101,
        text: "Which language is used to build Flutter apps?",
        answers: ["Java", "Kotlin", "Dart", "Swift"],
        correctIndex: 2,
        category: "Computer & Coding"
    },
    {
        id: 102,
        text: "What does 'HTML' stand for?",
        answers: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Mark Line", "Home Tool Markup Language"],
        correctIndex: 0,
        category: "Computer & Coding"
    },
    {
        id: 103,
        text: "In programming, array indexing usually starts at:",
        answers: ["1", "0", "-1", "10"],
        correctIndex: 1,
        category: "Computer & Coding"
    },
    {
        id: 104,
        text: "Which symbol is used for comments in Python?",
        answers: ["//", "/* */", "#", ""],
        correctIndex: 2,
        category: "Computer & Coding"
    },
    {
        id: 105,
        text: "What is the 'Brain' of the computer?",
        answers: ["RAM", "Hard Disk", "CPU", "GPU"],
        correctIndex: 2,
        category: "Computer & Coding"
    },
    {
        id: 106,
        text: "Which of these is a database language?",
        answers: ["HTML", "SQL", "CSS", "XML"],
        correctIndex: 1,
        category: "Computer & Coding"
    },
    {
        id: 107,
        text: "What represents 'True' or 'False' in coding?",
        answers: ["String", "Integer", "Boolean", "Float"],
        correctIndex: 2,
        category: "Computer & Coding"
    },
    {
        id: 108,
        text: "Which file extension is an Android App?",
        answers: [".exe", ".dmg", ".apk", ".ios"],
        correctIndex: 2,
        category: "Computer & Coding"
    },
    {
        id: 109,
        text: "What does 'HTTP' stand for in website URLs?",
        answers: ["HyperText Transfer Protocol", "High Transfer Text Path", "Hyper Tech Transmission Post", "Home Text Type Path"],
        correctIndex: 0,
        category: "Computer & Coding"
    },
    {
        id: 110,
        text: "Which key combination is the universal 'Undo'?",
        answers: ["Ctrl + C", "Ctrl + V", "Ctrl + Z", "Alt + F4"],
        correctIndex: 2,
        category: "Computer & Coding"
    },
    {
        id: 111,
        text: "What is the binary number for '5'?",
        answers: ["101", "111", "100", "010"],
        correctIndex: 0,
        category: "Computer & Coding"
    },
    {
        id: 112,
        text: "Which company owns the Android operating system?",
        answers: ["Apple", "Microsoft", "Google", "Samsung"],
        correctIndex: 2,
        category: "Computer & Coding"
    },

    // --- CURRENT AFFAIRS (2025-2026 Context) ---
    {
        id: 113,
        text: "Who won the ICC Champions Trophy in 2025?",
        answers: ["Australia", "India", "New Zealand", "England"],
        correctIndex: 1,
        category: "Current Affairs"
    },
    {
        id: 114,
        text: "Which Indian space mission sends astronauts to space?",
        answers: ["Chandrayaan-3", "Mangalyaan", "Gaganyaan", "Aditya-L1"],
        correctIndex: 2,
        category: "Current Affairs"
    },
    {
        id: 115,
        text: "What is the major AI trend predicted for 2026?",
        answers: ["Autonomous AI Agents", "VR Headsets", "Blockchain", "5G"],
        correctIndex: 0,
        category: "Current Affairs"
    },
    {
        id: 116,
        text: "Which country hosted the 2025 Champions Trophy Final?",
        answers: ["India", "England", "UAE (Dubai)", "Australia"],
        correctIndex: 2,
        category: "Current Affairs"
    },
    {
        id: 117,
        text: "What is the name of OpenAI's famous chatbot?",
        answers: ["Bard", "Gemini", "ChatGPT", "Claude"],
        correctIndex: 2,
        category: "Current Affairs"
    },

    // --- GENERAL KNOWLEDGE ---
    {
        id: 118,
        text: "Which planet is known as the 'Red Planet'?",
        answers: ["Venus", "Jupiter", "Mars", "Saturn"],
        correctIndex: 2,
        category: "General Knowledge"
    },
    {
        id: 119,
        text: "What is the chemical formula for Water?",
        answers: ["HO2", "H2O", "CO2", "O2"],
        correctIndex: 1,
        category: "General Knowledge"
    },
    {
        id: 120,
        text: "Which is the largest ocean on Earth?",
        answers: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctIndex: 3,
        category: "General Knowledge"
    },
    {
        id: 121,
        text: "How many bones are in the adult human body?",
        answers: ["206", "105", "300", "250"],
        correctIndex: 0,
        category: "General Knowledge"
    },

    // --- TRICKY MATHS ---
    {
        id: 122,
        text: "What is 5 + 5 x 5?",
        answers: ["50", "30", "25", "15"],
        correctIndex: 1,
        category: "Tricky Maths"
    },
    {
        id: 123,
        text: "Complete the sequence: 2, 4, 8, 16, ...",
        answers: ["20", "24", "30", "32"],
        correctIndex: 3,
        category: "Tricky Maths"
    },
    {
        id: 124,
        text: "What is the square root of 81?",
        answers: ["7", "8", "9", "10"],
        correctIndex: 2,
        category: "Tricky Maths"
    },
    {
        id: 125,
        text: "If you have 3 apples and take away 2, how many do you have?",
        answers: ["1", "2", "3", "0"],
        correctIndex: 1,
        category: "Tricky Maths"
    }
];

// Default export for backward compatibility if needed, but we'll use named exports
export const questions = userQuestions;

// Shuffle array helper
export function shuffleQuestions(arr: Question[]): Question[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
