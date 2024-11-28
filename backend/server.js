const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5000;

app.use(cors()); // Enable CORS for frontend access
app.use(bodyParser.json()); // Parse JSON body requests
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'auth_db',
    password: 'Nisha31@2002',
    port: 5432,
});

const billingPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'aws_billing_db',
    password: 'Nisha31@2002',
    port: 5432,
});

// Connect to PostgreSQL database
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Connection error', err.stack));

// Registration route (new user registration with hashed password)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).send('User created successfully');
    } catch (err) {
        console.error('Error during registration:', err.stack);
        res.status(500).send('Server error');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).send('User not found');
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Incorrect password');
        }
    } catch (err) {
        console.error('Error during login:', err.stack);
        res.status(500).send('Server error');
    }
});

// Billing data route
app.get('/api/billing', async (req, res) => {
    const filters = {
        account_name: req.query.account_name,
        application_name: req.query.application_name,
        environment: req.query.environment,
        service: req.query.service,
    };

    let query = `
        SELECT billing_month, SUM(cost) AS total_cost
        FROM aws_billing
        WHERE billing_month >= NOW() - INTERVAL '6 months'
    `;
    const params = [];

    // Dynamically build the query based on filters
    Object.keys(filters).forEach((key) => {
        if (filters[key]) {
            query += ` AND ${key} = $${params.length + 1}`;
            params.push(filters[key]);
        }
    });

    query += ' GROUP BY billing_month ORDER BY billing_month';

    try {
        const result = await billingPool.query(query, params);
        res.json(result.rows);  // Send back filtered results
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
