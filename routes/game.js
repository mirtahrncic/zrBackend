const { Router } = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../database');

const router = new Router();

router.use(bodyParser.json());
router.use(cors());

router.post('/game', async (req, res) => {
    const { gameId } = req.body; 
    //pogledam za tu igru sve rijeci eng i hrv u word
    //za svaku nadenu rijec prema njenom word id (znaci moram ga dobiti natrag) izvlacim starting position i direction
    //plus, hrv rijeci smjestim u jednu tablicu - vjerovatno s njihovim eng parom

    try {
        const wordsQuery = 'SELECT id, croatianword, foreignword FROM word WHERE game_id = $1'
        const  wordsResult = await db.query(wordsQuery, [gameId]);
        const words = wordsResult.rows;

        const croatianWords = [];
        const foreignWords = [];
        words.forEach(word => {
            croatianWords.push({ id: word.id, word: word.croatianword });
            foreignWords.push({ id: word.id, word: word.foreignword });
        });

        const wordsWithPositions = await fetchPositions(foreignWords);
        console.log(wordsWithPositions);
        res.status(200).json({ 
            croatianWords: croatianWords,
            foreignWordsWithPositions: wordsWithPositions
        });
        

    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

async function fetchPositions(words) {
    const wordsWithPositions = [];
    for(const word of words) {
        const positionQuery = 'SELECT startposition, direction FROM position WHERE word_id = $1';
        const positionResult = await db.query(positionQuery, [word.id]);
        const position = positionResult.rows[0];
        wordsWithPositions.push({
            id: word.id,
            word: word.word,
            start: position.startposition,
            direction: position.direction
        });

    }

    return wordsWithPositions;
}

router.post('/gameFinish', async (req, res) => {
    const {gameId, studentId, time, numberOfFound, studentName} = req.body;

    try {

        const query = `
        INSERT INTO result (game_id, student_id, time, foundnumber)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (game_id, student_id)
        DO UPDATE SET time = EXCLUDED.time, foundnumber = EXCLUDED.foundnumber
        RETURNING id
    `;
        //dodaj provjeru je li netko vec rjesavao -> ako je, samo promijeni taj rezultat
        //const query = 'INSERT INTO result (game_id, student_id, time, foundnumber, student_name) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const result = await db.query(query, [gameId, studentId, time, numberOfFound, studentName]);

        if(result.rows.length === 1) {
            res.json({ success: true, message: 'Game result submitted successfully' });
        } else {
            res.status(501).json({ success: false, message: 'Error submitting game result' });
        }
    } catch (error) {
        console.error('Error submitting game result: ', error);
        res.status(500).json({ success: false, message: 'An error occurred while submitting game result' });
    }
});

router.post('/statisticsFinish', async (req, res) => {
    const { gameId, studentId, notFound} = req.body;
    //notFound je lista -> za svaku rijec u notFound radim zapis u bazi

    if(!notFound) {
        console.log("Nothing to insert");
        return res.status(200).json({ success: true, message: 'No words to insert' });
    }

    try {
        const query = 'INSERT INTO statistic (game_id, student_id, words_list) VALUES ($1, $2, $3) RETURNING id';
        const result = await db.query(query, [gameId, studentId, notFound]);

        if(result.rows.length === 1) {
            res.json({ success: true, message: 'Game statistics submitted successfully' });
        } else {
            res.status(501).json({ success: false, message: 'Error submitting game statistics' });
        }
    } catch (error) {
        console.error('Error submitting game statistics: ', error);
        res.status(500).json({ success: false, message: 'An error occurred while submitting game statistics' });
    }
});

module.exports = router;