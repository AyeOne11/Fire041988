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

// 2. STARTUP RITUAL
const initDb = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS watcher_entries (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        const client = await pool.connect();
        await client.query(queryText);
        console.log("Watcher's Table has been manifested.");
        client.release();
    } catch (err) {
        console.error("Database initialization failed:", err.message);
    }
};
initDb();

// 3. API ROUTES

// GET: Fetch all visions
app.get('/api/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM watcher_entries ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "The Archive is unreachable.", details: err.message });
    }
});

// POST: Seal a new vision
app.post('/api/entries', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO watcher_entries (title, content) VALUES ($1, $2) RETURNING *',
            [title, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Could not seal the entry.", details: err.message });
    }
});

// PUT: The Rite of Revision (Edit)
app.put('/api/entries/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'UPDATE watcher_entries SET title = $1, content = $2 WHERE id = $3 RETURNING *',
            [title, content, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Revision failed.", details: err.message });
    }
});

// DELETE: The Rite of Dissolution (Delete)
app.delete('/api/entries/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM watcher_entries WHERE id = $1', [req.params.id]);
        res.json({ message: "Entry dissolved." });
    } catch (err) {
        res.status(500).json({ error: "Dissolution failed.", details: err.message });
    }
});

// Health Check
app.get('/', (req, res) => {
    res.send("The Gateway is standing by. API is at /api/entries");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`The Gateway is active on port ${PORT}`));
