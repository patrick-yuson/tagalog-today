require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const XLSX = require('xlsx');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL - tagalog_today_db');
    release();
});

const upload = multer({ dest: 'uploads/' });

// Get ALL
app.get('/api/words', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ph_words ORDER BY starting_letter, word');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching words:', err);
        res.status(500).json({ error: err.message });
    }
})

// Get by Letter
app.get('/api/words/letter/:letter', async (req, res) => {
    try {
        const { letter } = req.params;
        const result = await pool.query(
            'SELECT * FROM ph_words WHERE starting_letter = $1 ORDER BY word',
            [letter.toUpperCase()]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching words by letter:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Upload XLSX
app.post('/api/upload-xlsx', upload.single('file'), async (req, res) => {
    try {
        console.log('Fil received:', req.file);

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Processing ${data.length} rows from Excel`);
        console.log('Column headers found:', data.length > 0 ? Object.keys(data[0]) : 'No data');
        console.log('First row preview:', data[0]);

        const client = await pool.connect();
        let insertedCount = 0;
        let errors = [];

        try {
            await client.query('BEGIN');
            
            for (let i = 5; i < data.length; i++) {
                const row = data[i];
                
                try {
                    // Map your Excel columns - adjust these to match your actual Excel headers
                    const startingLetter = row['letter']; // adjust as needed
                    const word = row['word'];
                    const definition = row['definition'];
                    const dialect = row['dialect'] || null;
                    const sentiment = row['sentiment'] || null;

                    if (startingLetter && word && definition) {
                        await client.query(
                            'INSERT INTO ph_words (starting_letter, word, definition, dialect, sentiment) VALUES ($1, $2, $3, $4, $5)',
                            [
                                startingLetter.toString().charAt(0).toUpperCase(), 
                                word.toString(), 
                                definition.toString(), 
                                dialect ? dialect.toString() : null, 
                                sentiment ? sentiment.toString() : null
                            ]
                        );
                        insertedCount++;
                    } else {
                        errors.push(`Row ${i + 1}: Missing required data`);
                    }
                } catch (rowError) {
                    errors.push(`Row ${i + 1}: ${rowError.message}`);
                }
            }
            
            await client.query('COMMIT');
            res.json({ 
                message: 'Data uploaded successfully', 
                rowsInserted: insertedCount,
                totalRows: data.length,
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        fs.unlinkSync(req.file.path);
    } catch (err) {
        console.error('Error uploading data:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})