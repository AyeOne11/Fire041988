const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. SAFE POOL CONFIGURATION
// We check if the variable exists before trying to use it to prevent 500 crashes
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("CRITICAL ERROR: DATABASE_URL is not defined in the Environment Variables!");
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false // Required for Render/Heroku connections
  }
});

// 2. ERROR HANDLER FOR THE POOL
// This prevents the server from dying if the database disconnects randomly
pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    // We don't exit the process; we let the server stay alive
});

// 3. STARTUP RITUAL (Table Creation)
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
        console.error("Database connection failed during startup:", err.message);
        // This log will tell you EXACTLY why the 500 error is happening
    }
};
initDb();

// 4. API ROUTES
app.get('/api/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM watcher_entries ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("GET Error:", err.message);
        res.status(500).json({ error: "The Archive is currently unreachable.", details: err.message });
    }
});

app.post('/api/entries', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO watcher_entries (title, content) VALUES ($1, $2) RETURNING *',
            [title, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("POST Error:", err.message);
        res.status(500).json({ error: "Could not seal the entry.", details: err.message });
    }
});

// Add a basic "Health Check" route for the main URL
app.get('/', (req, res) => {
    res.send("The Gateway is standing by. API is at /api/entries");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The Gateway is active on port ${PORT}`));
