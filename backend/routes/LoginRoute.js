const express = require('express');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const router = express.Router();
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

client.connect(); // Connect to PostgreSQL database

