const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDb = async () => {
    try {
        const client = await pool.connect();
        // Schema update: project_name is now strictly NOT NULL
        await client.query(`
            CREATE TABLE IF NOT EXISTS manuscripts (
                id SERIAL PRIMARY KEY,
                project_name TEXT NOT NULL, 
                chapter_title TEXT NOT NULL,
                content TEXT NOT NULL,
                word_count INTEGER DEFAULT 0,
                last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        client.release();
    } catch (err) { console.error("Vault Error:", err.message); }
};
initDb();

app.get('/api/manuscripts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM manuscripts ORDER BY last_edited DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/manuscripts/autosave', async (req, res) => {
    const { id, project_name, title, content, wordCount } = req.body;
    
    // Log for debugging: Check your Render logs for this line!
    console.log(`FORGE COMMAND: Received [${project_name}]`);

    // Strict priority: if frontend sends a name, we use it. 
    const finalName = (project_name && project_name.trim() !== "") ? project_name : "Untitled Work";

    try {
        if (id) {
            const result = await pool.query(
                'UPDATE manuscripts SET project_name = $1, chapter_title = $2, content = $3, word_count = $4, last_edited = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
                [finalName, title, content, wordCount, id]
            );
            res.json(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO manuscripts (project_name, chapter_title, content, word_count) VALUES ($1, $2, $3, $4) RETURNING *',
                [finalName, title, content, wordCount]
            );
            res.json(result.rows[0]);
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/manuscripts/rename-project', async (req, res) => {
    const { oldName, newName } = req.body;
    try {
        await pool.query('UPDATE manuscripts SET project_name = $1 WHERE project_name = $2', [newName, oldName]);
        res.json({ message: "Evolved" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/manuscripts/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM manuscripts WHERE id = $1', [req.params.id]);
        res.json({ message: "Dissolved" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Forge Gateway online on ${PORT}`));
