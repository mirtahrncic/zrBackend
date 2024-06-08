const { Router } = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../database');

const router = new Router();

router.use(bodyParser.json());
router.use(cors());

router.post('/newGame/create', async (req, res) => {
    const { name, class_id, teacher_id } = req.body;

    try {
        const query = 'INSERT INTO game (name, class_id, teacher_id) VALUES ($1, $2, $3) RETURNING id';
        const result = await db.query(query, [name, class_id, teacher_id]);

        if(result.rows.length === 1) {
            const gameId = result.rows[0].id;
            res.json({ success: true, gameId, message: 'Game created successfully' });
        } else {
            res.status(501).json({ success: false, message: 'Error creating game' });
        }
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ success: false, message: 'An error occurred while creating game' });
    }


});

router.post('/newGame/add', async (req, res) => {
    /*tu cu dobiti listu parova rijeci strana-hrvatska*/
    /*od toga naporavim 2 liste: strane i hrv rijeci*/
    /*strane rasporedujem, hrv mi trebaju za bazu i kasnije*/

    try {
        const { gameId, wordPairs } = req.body;

        const foreignWords = [];
        const croatianWords = [];

        wordPairs.forEach(pair => {
            foreignWords.push(pair.word1);
            croatianWords.push(pair.word2);
        });

        //console.log("Foreign words: ", foreignWords);
        //console.log("Croatian words: " , croatianWords);

        for(let i = 0; i < foreignWords.length; i++) {
            var word = foreignWords[i].toUpperCase();
            foreignWords[i] = word;
        }


        /*raspored po 10x10 gridu*/
        const grid = [];
        const n = 10, m = 10;
        for(let i = 0; i < n; i++) {
            const row = [];
            for(let j = 0; j < m; j++) {
                row.push(0);
            }
            grid.push(row);
        }

        console.log("Created empty grid");

        const startPositions = [];
        const directions = [];

        /*sada imamo polje 10x10 puno 0, trebaju nam moguci smjerovi*/
        const orientations = ["leftright", "updown", "diagonalup", "diagonaldown"];
        for(let i = 0; i < foreignWords.length; i++) {
            const word = foreignWords[i];
            
                var orientation = '';
                let uspjeh = false;
                while(!uspjeh) {
                    const rand = Math.floor(Math.random() * orientations.length);
                    orientation = orientations[rand];
                    var step_x = 0, step_y = 0;

                    if(orientation === "leftright") {
                        //console.log("Chose leftright");
                        step_x = 1;
                        step_y = 0;
                    } else if(orientation === "updown") {
                        //console.log("Chose updown");
                        step_x = 0;
                        step_y = 1;
                    } else if(orientation === "diagonalup") {
                        //console.log("chose diup");
                        step_x = 1;
                        step_y = -1;
                    } else if(orientation === "diagonaldown") {
                        //console.log("Chose didown");
                        step_x = 1;
                        step_y = 1;
                    } else {
                        console.log("failed finding orientation");
                    }
                    
                    var start_x = Math.floor(Math.random() * n);
                    var start_y = Math.floor(Math.random() * m);

                    var ending_x = start_x + word.length * step_x;
                    var ending_y = start_y + word.length * step_y;

                    console.log(start_x, ",", start_y, " -> ", ending_x, ",", ending_y, " --- orientation: ", orientation);

                    if(ending_x < 0 || ending_x >= n || ending_y < 0 || ending_y >= m){
                        uspjeh = false;
                        console.log("failed to place bc end");
                    } else {
                        for(let j = 0; j < word.length; j++) {
                            const letter = word[j];
                            const letterPosition_x = start_x + j * step_x;
                            const letterPosition_y = start_y + j * step_y;
                            if((grid[letterPosition_x][letterPosition_y] === letter) || (grid[letterPosition_x][letterPosition_y] === 0)) {
                                uspjeh = true;
                            } else {
                                uspjeh = false;
                                console.log("Failed to place bc of letter");
                                break;
                            }
                        }

                    }
                    
            }

            console.log("Placed it with: ", start_x, ",", start_y, " and orientation: ", orientation);

            //sada ako sam stvarno smjestila rijec, upisujem ju u grid
            for(let j = 0; j < word.length; j++) {
                const letter = word[j];
                const letterPosition_x = start_x + j * step_x;
                const letterPosition_y = start_y + j * step_y;

                grid[letterPosition_x][letterPosition_y] = letter;
            }


            startPositions.push(start_x);
            startPositions.push(start_y);
            directions.push(orientation);

            console.log("Word ", word, "put in grid");
        }

        

        /*iz tih polja sada podatke upisujemo u bazu */
        /*znaci jedan zapis u bazi je zapravo: id koji ce se sam generirati + start(x,y) + end(x,y) + id igre + id rijeci*/

        /*dvije tablice word i word_position*/
        /*u word dodajemo croatian word, foreign word i game id, natrag zelim game id*/
        /*u word_position stavljam start(x,y), end(x,y), word_id, game_id*/
        let j = 0;
        for(let i = 0; i < foreignWords.length; i++) {
            var foreign_word = foreignWords[i];
            var croatian_word = croatianWords[i];
            var start_position = startPositions[j] + "," + startPositions[j + 1];
            j = j + 2;
            var direction = directions[i];
            try {
                const query = 'INSERT INTO word (croatianword, foreignword, game_id) VALUES ($1, $2, $3) RETURNING id'
                const result = await db.query(query, [croatian_word, foreign_word, gameId]);

                if(result.rows.length === 1) {
                    const wordId = result.rows[0].id;
                    try {
                        const query = 'INSERT INTO position (startposition, game_id, word_id, direction) VALUES ($1, $2, $3, $4)'
                        const result = await db.query(query, [start_position, gameId, wordId, direction]);

                    } catch(error) {
                        console.error('Error placing word positions', error);
                    }
                }
            } catch (error) {
                console.error('Error adding words to game:', error);
            
            }
    } 

    res.json({success: true, message: "Adding words successfully." });
} catch (error) {
    console.error("Error adding words: ", error);
    res.status(500).json({success: false, message: "An error occured while adding words to game."});
}
});

module.exports = router;