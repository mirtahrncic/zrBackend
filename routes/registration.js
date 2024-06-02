const { Router } = require("express");
const bodyParser = require('body-parser');
const db = require('./database');
const jwt = require('jsonwebtoken');

const router = new Router();

router.use(bodyParser.json());

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const query = 'INSERT INTO teacher (name, email, password) VALUES ($1, $2, $3)';
        const result = await db.query(query, [name, email, password]);

        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'An error occurred during registration' });
    }
});

module.exports = router;