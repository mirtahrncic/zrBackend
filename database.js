/*const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: '5432',
    password: 'Slatkica1',
    database: 'Crossword'
});

client.connect();

module.exports = client;*/

/*client.query("Select * from school", (err, res) => {
    if(!err) {
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
    client.end;
});*/


const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});

client.connect();
module.exports = client;





