// Sample trivia questions for Blaze Trivia Arena
export interface Question {
    id: number;
    text: string;
    answers: string[];
    correctIndex: number;
    category: string;
}

// Demo/Admin Questions (Simple Demo Set)
export const adminQuestions: Question[] = [
    {
        id: 1,
        text: "What colour is the sky on a clear day?",
        answers: ["Green", "Blue", "Red", "Yellow"],
        correctIndex: 1,
        category: "Demo"
    },
    {
        id: 2,
        text: "How many days are in a week?",
        answers: ["5", "6", "7", "8"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 3,
        text: "What is 2 + 2?",
        answers: ["3", "4", "5", "6"],
        correctIndex: 1,
        category: "Demo"
    },
    {
        id: 4,
        text: "Which animal is known as man's best friend?",
        answers: ["Cat", "Dog", "Bird", "Fish"],
        correctIndex: 1,
        category: "Demo"
    },
    {
        id: 5,
        text: "Which planet do we live on?",
        answers: ["Mars", "Venus", "Earth", "Jupiter"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 6,
        text: "What shape has 3 sides?",
        answers: ["Square", "Circle", "Triangle", "Rectangle"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 7,
        text: "What do bees produce?",
        answers: ["Milk", "Honey", "Silk", "Sugar"],
        correctIndex: 1,
        category: "Demo"
    },
    {
        id: 8,
        text: "How many hours are in one day?",
        answers: ["12", "20", "24", "48"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 9,
        text: "What is the capital city of France?",
        answers: ["London", "Berlin", "Rome", "Paris"],
        correctIndex: 3,
        category: "Demo"
    },
    {
        id: 10,
        text: "Which fruit is red and grows on trees?",
        answers: ["Banana", "Apple", "Mango", "Grapes"],
        correctIndex: 1,
        category: "Demo"
    },
    {
        id: 11,
        text: "What do we use to write on a whiteboard?",
        answers: ["Pencil", "Pen", "Marker", "Chalk"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 12,
        text: "What is 10 x 10?",
        answers: ["10", "20", "100", "1000"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 13,
        text: "Which of these is a primary color?",
        answers: ["Orange", "Green", "Purple", "Blue"],
        correctIndex: 3,
        category: "Demo"
    },
    {
        id: 14,
        text: "What language do people speak in the UK?",
        answers: ["French", "Spanish", "English", "German"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 15,
        text: "Which of these animals can fly?",
        answers: ["Lion", "Shark", "Eagle", "Elephant"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 16,
        text: "How many legs does a spider have?",
        answers: ["4", "6", "8", "10"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 17,
        text: "What is the opposite of 'hot'?",
        answers: ["Warm", "Cool", "Cold", "Icy"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 18,
        text: "Which season comes after winter?",
        answers: ["Autumn", "Summer", "Spring", "Monsoon"],
        correctIndex: 2,
        category: "Demo"
    },
    {
        id: 19,
        text: "What do plants need to grow?",
        answers: ["Milk & Darkness", "Water & Sunlight", "Sand & Wind", "Ice & Shade"],
        correctIndex: 1,
        category: "Demo"
    },
    {
        id: 20,
        text: "How many letters are in the English alphabet?",
        answers: ["24", "25", "26", "27"],
        correctIndex: 2,
        category: "Demo"
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
