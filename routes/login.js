const { Router } = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../database');
const jwt = require('jsonwebtoken');

const router = new Router();

router.use(bodyParser.json());
router.use(cors());


router.post('/login/teacher', async (req, res) => {
    console.log("Trying to log in");
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM teacher WHERE email = $1 AND password = $2';
        const result = await db.query(query, [email, password]);

        if(result.rows.length === 1) {
            const id = result.rows[0].id;
            const token = jwt.sign({ email: result.rows[0].email}, 'your_secret_key');
            res.json({ success: true, token, userId: id, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

router.post("/login/student", async (req, res)  => {
    const { studentId, password } = req.body;

    try {
        const query = 'SELECT * FROM student WHERE id = $1 AND password = $2';
        const result = await db.query(query, [studentId, password]);

        if(result.rows.length === 1) {
            const id = result.rows[0].id;
            const classId = result.rows[0].class_id;
            res.json({ success: true, userId: id, classId: classId, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

    } catch(error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});


module.exports = router;