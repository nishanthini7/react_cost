const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// PostgreSQL Connection Pools
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

// Routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).send('User created successfully');
    } catch (err) {
        console.error('Error during registration:', err.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Incorrect password' });
        }
    } catch (err) {
        console.error('Error during login:', err.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/billing', async (req, res) => {
    const filters = {
        account_name: req.query.account_name,
        application_name: req.query.application_name,
        environment: req.query.environment,
        service: req.query.service,
    };

    let query = `
        SELECT DATE_TRUNC('month', billing_month) AS billing_month, SUM(cost) AS total_cost
        FROM aws_billing
        WHERE billing_month >= NOW() - INTERVAL '6 months'
    `;
    const params = [];

    Object.keys(filters).forEach((key) => {
        if (filters[key]) {
            query += ` AND ${key} = $${params.length + 1}`;
            params.push(filters[key]);
        }
    });

    query += ' GROUP BY billing_month ORDER BY billing_month';

    try {
        const result = await billingPool.query(query, params);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/filter-options', async (req, res) => {
    try {
        const accounts = await billingPool.query('SELECT DISTINCT account_name FROM aws_billing');
        const apps = await billingPool.query('SELECT DISTINCT application_name FROM aws_billing');
        const environments = await billingPool.query('SELECT DISTINCT environment FROM aws_billing');
        const services = await billingPool.query('SELECT DISTINCT service FROM aws_billing');

        res.json({
            accountNames: accounts.rows.map((row) => row.account_name),
            applicationNames: apps.rows.map((row) => row.application_name),
            environments: environments.rows.map((row) => row.environment),
            services: services.rows.map((row) => row.service),
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
});

app.get('/api/top-apps', async (req, res) => {
    try {
        const query = `
            SELECT application_name, SUM(cost) AS total_cost
            FROM aws_billing
            GROUP BY application_name
            ORDER BY total_cost DESC
            LIMIT 5;
        `;
        const result = await billingPool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching top 5 apps:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/billing/prod-vs-nonprod', async (req, res) => {
    try {
        const query = `
            SELECT 
              TO_CHAR(billing_month, 'YYYY-MM') AS month,
              SUM(CASE 
                WHEN LOWER(environment) = 'prod' OR LOWER(environment) = 'production' THEN cost
                ELSE 0 
              END) AS prod_cost,
              SUM(CASE 
                WHEN LOWER(environment) != 'prod' AND LOWER(environment) != 'production' THEN cost
                ELSE 0 
              END) AS non_prod_cost
            FROM aws_billing
            WHERE billing_month >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
            GROUP BY TO_CHAR(billing_month, 'YYYY-MM')
            ORDER BY TO_CHAR(billing_month, 'YYYY-MM');
        `;
        
        const result = await billingPool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching prod vs non-prod data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
