import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface User {
    id: number;
    name: string;
    credits: number;
    referralCode: string;
    referralCount: number;
}

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
dotenv.config();

const db = new sqlite3.Database('./photorevive.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      credits INTEGER NOT NULL,
      referralCode TEXT NOT NULL UNIQUE,
      referralCount INTEGER NOT NULL DEFAULT 0
    )`);
  }
});

// Custom promisified functions for sqlite3
const dbGet = (query: string, params: any[] = []): Promise<User | undefined> => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row: User) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbRun = (query: string, params: any[] = []): Promise<{ lastID: number }> => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID });
        });
    });
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE_URL = process.env.GEMINI_API_BASE_URL;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generationConfig = {
    temperature: 0.4,
    topP: 1,
    topK: 32,
    maxOutputTokens: 4096,
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

// API routes will go here

app.get('/', (req, res) => {
    res.send('PhotoRevive AI Backend is running!');
});

// Get user data / login / registration
app.post('/api/login', async (req, res) => {
    const { name, referralCode } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const lowerCaseName = name.toLowerCase();

    try {
        let user = await dbGet('SELECT * FROM users WHERE name = ?', [lowerCaseName]);
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            const newUserReferralCode = `${name.toUpperCase().replace(/\s/g, '')}${Math.floor(100 + Math.random() * 900)}`;
            const result = await dbRun(
                'INSERT INTO users (name, credits, referralCode) VALUES (?, ?, ?)',
                [lowerCaseName, 50, newUserReferralCode]
            );
            user = await dbGet('SELECT * FROM users WHERE id = ?', [result.lastID]);
        }

        if (!user) {
            // This should not happen, but as a safeguard
            return res.status(500).json({ message: 'Failed to create or find user' });
        }

        // Superuser check for 'gizatrustam'
        if (lowerCaseName === 'gizatrustam') {
            await dbRun('UPDATE users SET credits = ? WHERE id = ?', [999999, user.id]);
            const updatedUser = await dbGet('SELECT * FROM users WHERE id = ?', [user.id]);
            if (updatedUser) {
                user = updatedUser;
            }
        }

        if (isNewUser && referralCode) {
            const referrer = await dbGet('SELECT * FROM users WHERE lower(referralCode) = ?', [referralCode.trim().toLowerCase()]);
            if (referrer && referrer.name !== lowerCaseName) {
                await dbRun('UPDATE users SET credits = credits + 25, referralCount = referralCount + 1 WHERE id = ?', [referrer.id]);
            }
        }
        
        // We return user data, but without the id from the database
        const { id, ...userData } = user;
        res.json(userData);

    } catch (error: any) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Spend credits
app.post('/api/spend', async (req, res) => {
    const { name, amount } = req.body;
    if (!name || !amount) {
        return res.status(400).json({ message: 'Name and amount are required' });
    }

    try {
        const user = await dbGet('SELECT * FROM users WHERE name = ?', [name.toLowerCase()]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.credits < amount) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }

        await dbRun('UPDATE users SET credits = credits - ? WHERE name = ?', [amount, name.toLowerCase()]);
        const updatedUser = await dbGet('SELECT * FROM users WHERE name = ?', [name.toLowerCase()]);
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found after update' });
        }
        
        const { id, ...userData } = updatedUser;
        res.json(userData);

    } catch (error: any) {
        console.error('Spend credits error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add credits (e.g., after payment)
app.post('/api/add-credits', async (req, res) => {
    const { name, amount } = req.body;
    if (!name || !amount) {
        return res.status(400).json({ message: 'Name and amount are required' });
    }

    try {
        const user = await dbGet('SELECT * FROM users WHERE name = ?', [name.toLowerCase()]);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await dbRun('UPDATE users SET credits = credits + ? WHERE name = ?', [amount, name.toLowerCase()]);
        const updatedUser = await dbGet('SELECT * FROM users WHERE name = ?', [name.toLowerCase()]);
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found after update' });
        }

        const { id, ...userData } = updatedUser;
        res.json(userData);

    } catch (error: any) {
        console.error('Add credits error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/restore', async (req, res) => {
    const { base64ImageData, mimeType, prompt } = req.body;

    if (!base64ImageData || !mimeType || !prompt) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig,
            safetySettings,
            // @ts-ignore
            baseURL: GEMINI_API_BASE_URL,
        });

        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();
        
        // Assuming the API returns a base64 string directly in the text response
        // You might need to adjust this based on the actual API response format
        if (text) {
            // The response might be plain text or a JSON string.
            // Let's try to parse it as JSON first.
            try {
                const jsonResponse = JSON.parse(text);
                if (jsonResponse.image_url) {
                     res.json({ imageUrl: jsonResponse.image_url, mimeType: 'image/png' }); // Adjust mimeType if needed
                     return;
                }
            } catch (e) {
                // Not a JSON response, assume it's the base64 string
            }

            // Assuming the response is the base64 string of the image
            const restoredMimeType = 'image/png'; // Adjust if the API provides mime type
            res.json({ imageUrl: `data:${restoredMimeType};base64,${text}`, mimeType: restoredMimeType });
        } else {
            throw new Error("The model did not return any content.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ message: 'Failed to restore image' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
