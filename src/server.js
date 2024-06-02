const express = require('express');
const bodyParser = require('body-parser');
const loginRoutes = require('../routes/login.js');
const newGameRoute = require('../routes/newGame.js');
const myGamesRoute = require('../routes/myGames.js');
const gameRoute = require('../routes/game.js');
const fetchingRoute = require('../routes/fetching.js');
const resultsRoute = require('../routes/results.js');

const app = express();
//const port = 3001;

app.use(bodyParser.json());

app.use('/api', loginRoutes);
app.use('/api', newGameRoute);
app.use('/api', myGamesRoute);
app.use('/api', gameRoute);
app.use('/api', fetchingRoute);
app.use('/api', resultsRoute);


/*app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});*/


