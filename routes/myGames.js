const { Router } = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../database');

const router = new Router();

router.use(bodyParser.json());
router.use(cors());

router.post('/myGames/teacher', async (req, res) => {
    const { teacherId } = req.body;

    try {
        const query = 'SELECT id, name FROM game WHERE teacher_id = $1'
        const games = await db.query(query, [teacherId]);
        //console.log(games);

        res.json(games);

    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

router.post('/myGames/student', async (req, res) => {
    const { classId } = req.body;

    try {
        const query = 'SELECT id, name FROM game WHERE class_id = $1'
        const games = await db.query(query, [classId]);
        //console.log(games);

        res.json(games);

    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

module.exports = router;