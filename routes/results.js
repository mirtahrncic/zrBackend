const { Router } = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../database');

const router = new Router();

router.use(bodyParser.json());
router.use(cors());

router.post('/results', async (req, res) => {
    const { game_id } = req.body;

    try {
        const query = `
            SELECT student_id, time, foundnumber, student_name
            FROM result
            WHERE game_id = $1
            ORDER BY foundnumber DESC, time ASC
        `;
        //const query = 'SELECT student_id, time, foundnumber, student_name FROM result WHERE game_id = $1';
        const resultsList = await db.query(query, [game_id]);

        console.log(resultsList);

        res.json(resultsList);


    } catch (error){
        console.error('Error fetching game results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/statistics', async (req, res) => {
    const { game_id } = req.body;

    try {
        const query = 'SELECT student_id, words_list FROM statistic WHERE game_id = $1';
        const result = await db.query(query, [game_id]);

        //prodi po listi i pronadi npr 3 najcesce pogreske
        //i te tri rijeci vrati

        if(result.rows.length === 0) {
            return res.status(404).json({ error: 'No statistics found for this game' });
        }

        const wordFrequency = {};

        result.rows.forEach(row => {
            if (row.words_list) { 
                const wordsList = row.words_list.split(',');

                wordsList.forEach(word => {
                    if (wordFrequency[word]) {
                        wordFrequency[word]++;
                    } else {
                        wordFrequency[word] = 1;
                    }
                });
            }
        });

        const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

        const mostCommonWords = sortedWords.map(entry => entry[0]);
        console.log(mostCommonWords);
        res.json({ mostCommonWords });



    } catch (error) {
        console.error('Error fetching game statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;