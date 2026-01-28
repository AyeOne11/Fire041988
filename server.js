const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// The Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// STARTUP RITUAL: Auto-create the table if it doesn't exist
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
        await pool.query(queryText);
        console.log("Watcher's Table has been manifested.");
    } catch (err) {
        console.error("Manifestation failed:", err);
    }
};
initDb();

// API: Get all entries (The Index)
app.get('/api/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM watcher_entries ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// API: Save new entry (The Seal)
app.post('/api/entries', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO watcher_entries (title, content) VALUES ($1, $2) RETURNING *',
            [title, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The Gateway is active on port ${PORT}`));