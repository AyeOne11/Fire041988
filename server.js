const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. SAFE POOL CONFIGURATION
const dbUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
});

// 2. STARTUP RITUAL (Watcher & Athenaeum Tables)
const initDb = async () => {
    try {
        const client = await pool.connect();
        
        // Watcher Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS watcher_entries (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Athenaeum Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS manuscripts (
                id SERIAL PRIMARY KEY,
                chapter_title TEXT NOT NULL,
                content TEXT NOT NULL,
                word_count INTEGER DEFAULT 0,
                last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("The Gateway is open: All tables manifested.");
        client.release();
    } catch (err) {
        console.error("Database initialization failed:", err.message);
    }
};
initDb();

// --- WATCHER ROUTES ---
app.get('/api/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM watcher_entries ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/entries', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query('INSERT INTO watcher_entries (title, content) VALUES ($1, $2) RETURNING *', [title, content]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/entries/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query('UPDATE watcher_entries SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/entries/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM watcher_entries WHERE id = $1', [req.params.id]);
        res.json({ message: "Ritual dissolved." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ATHENAEUM ROUTES ---
app.get('/api/manuscripts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM manuscripts ORDER BY last_edited DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/manuscripts/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM manuscripts WHERE id = $1', [req.params.id]);
        res.json({ message: "Chapter dissolved." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Gateway active on port ${PORT}`));
