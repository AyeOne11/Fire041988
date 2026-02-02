const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
// We keep this for local testing, but the code below is "Render-Hardened"
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());

// 1. HARDENED CONNECTION LOGIC
// We use process.env.DATABASE_URL which Render injects automatically
const dbUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Prevent the server from crashing if the DB connection blinks
pool.on('error', (err) => {
    console.error('DATABASE GHOST ENCOUNTERED:', err);
});

// 2. THE DUAL MANIFESTATION (Table Creation)
const initDb = async () => {
    try {
        const client = await pool.connect();
        
        // Manifest Watcher Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS watcher_entries (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Manifest Athenaeum Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS manuscripts (
                id SERIAL PRIMARY KEY,
                chapter_title TEXT NOT NULL,
                content TEXT NOT NULL,
                word_count INTEGER DEFAULT 0,
                last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Vaults Synchronized: Watcher and Athenaeum are active.");
        client.release();
    } catch (err) {
        console.error("Manifestation Failed:", err.message);
    }
};
initDb();

// --- WATCHER ROUTES (The Adytum) ---
app.get('/api/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM watcher_entries ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Watcher fetch failed.", details: err.message });
    }
});

app.post('/api/entries', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query('INSERT INTO watcher_entries (title, content) VALUES ($1, $2) RETURNING *', [title, content]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Seal failed.", details: err.message });
    }
});

app.put('/api/entries/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query('UPDATE watcher_entries SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Revision failed.", details: err.message });
    }
});

app.delete('/api/entries/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM watcher_entries WHERE id = $1', [req.params.id]);
        res.json({ message: "Ritual dissolved." });
    } catch (err) {
        res.status(500).json({ error: "Dissolution failed.", details: err.message });
    }
});

// --- ATHENAEUM ROUTES (The Forge) ---
app.get('/api/manuscripts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM manuscripts ORDER BY last_edited DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Athenaeum fetch failed.", details: err.message });
    }
});

app.post('/api/manuscripts/autosave', async (req, res) => {
    const { id, title, content, wordCount } = req.body;
    try {
        if (id) {
            const result = await pool.query(
                'UPDATE manuscripts SET chapter_title = $1, content = $2, word_count = $3, last_edited = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
                [title, content, wordCount, id]
            );
            res.json(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO manuscripts (chapter_title, content, word_count) VALUES ($1, $2, $3) RETURNING *',
                [title, content, wordCount]
            );
            res.json(result.rows[0]);
        }
    } catch (err) {
        res.status(500).json({ error: "Forge sync failed.", details: err.message });
    }
});

app.delete('/api/manuscripts/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM manuscripts WHERE id = $1', [req.params.id]);
        res.json({ message: "Chapter dissolved." });
    } catch (err) {
        res.status(500).json({ error: "Chapter dissolution failed.", details: err.message });
    }
});

// HEALTH CHECK & PORT
app.get('/', (req, res) => {
    res.send("The Gateway is standing by. All realms connected.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Gateway is active on port ${PORT}`);
});
