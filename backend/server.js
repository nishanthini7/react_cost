const express = require('express');
const cors = require('cors');
const router = express.Router();
const bodyParser = require('body-parser');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');


const app = express();

const port = 5000;

app.use(cors()); // Enable CORS for frontend access
app.use(bodyParser.json()); // Parse JSON body requests
app.use(express.json());

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'auth_db',
  password: 'Nisha31@2002',
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

// Example route to handle GET requests to the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Registration route (new user registration with hashed password)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store the user with the hashed password
    await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(201).send('User created successfully');
  } catch (err) {
    console.error('Error during registration:', err.stack);
    res.status(500).send('Server error');
  }
});
// Define the login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).send({ error: 'User not found' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.status(200).send({ message: 'Login successful' });
    } else {
      res.status(401).send({ error: 'Incorrect password' });
    }
  } catch (err) {
    console.error('Error during login:', err.stack);
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;


// Login route (check username and password)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

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


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
