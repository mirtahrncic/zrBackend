const { Router } = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../database');
const jwt = require('jsonwebtoken');

const router = new Router();

router.use(bodyParser.json());
router.use(cors());

router.post('/schoolList', async (req, res) => {
    try {
        const query = 'SELECT name, id FROM school';
        const schoolList = await db.query(query, []);
        res.json(schoolList);

    } catch(error) {
        console.error("Error fetching schools: ", error);
        res.status(500).json({ success: false, message: 'An error occurred during fetching schools' });
    }
});

router.post('/classList', async (req, res) => {
    const { school_id } = req.body;
    console.log(school_id);
    try {
        const query = 'SELECT name, id FROM class WHERE school_id = $1';
        const classList = await db.query(query, [school_id]);
        //console.log(classList);
        res.json(classList);

    } catch (error) {
        console.error("Error fetching classes: ", error);
        res.status(500).json({ success: false, message: 'An error occurred during fetching classes' });
    }
});

router.post('/newStudent', async (req, res) => {
    const { class_id, name, surname } = req.body;
    const fullName = name + " " + surname;
    console.log("Students name: ", fullName);
    const password = generatePassword();
    console.log("Students password: ", password);

    try {
        const query = 'INSERT INTO student (fullname, password, class_id) VALUES ($1, $2, $3)';
        const result = await db.query(query, [fullName, password, class_id]);

        res.status(200).json({ success: true, password: password, message: 'New student successfully added' });


    } catch (error) {
        console.log("Error addding new student: ", error);
        res.status(500).json({ success: false, message: 'An error occurred when adding new student' });
    }

});


router.post('/newPassword', async (req, res) => {
    const { student_id } = req.body;
    const password = generatePassword();

    try {
        const query = 'UPDATE student SET password = $1 WHERE id = $2';
        const response = await db.query(query, [password, student_id]);

        res.status(200).json({ success: true, password: password, message: 'Password successfully changed' });

    } catch (error) {
        console.log("Error changing student password: ", error);
        res.status(500).json({ success: false, message: 'An error occurred when changing student password' });
    }
});

function generatePassword() {
    //generiraj 3 random broja od npr 1 do 9
    //spremi ih kao string sa zarezima
    //kada ce se provjeravati je li dobra sifra, samo usporediti dva string
    var password = [];
    const animals = ["medvjed", "slon", "žirafa", "koala", "lav", "majmun", "panda", "tigar", "zebra"];
    for(let i = 0; i < 3; i++) {
        var random = Math.floor(Math.random() * animals.length);
        password.push(animals[random]);
    }
    return password.join(',');

}

router.post('/studentsList', async (req, res) => {
    const { class_id } = req.body;

    try {
        const query = 'SELECT id, fullname FROM student WHERE class_id = $1';
        const studentsList = await db.query(query, [class_id]);
        console.log(studentsList);

        //res.status(200).json({ success: true, students: studentsList, message: 'Student list successfully fetched' });
        res.json(studentsList);
    } catch (error) {
        console.log("Error fetching students list: ", error);
        res.status(500).json({ success: false, message: 'An error occurred when fetching students list' });
    }
});

router.post('/gamesList', async (req, res) => {
    const { class_id } = req.body;

    try {
        const query = 'SELECT id, name FROM game WHERE class_id = $1';
        const gamesList = await db.query(query, [class_id]);
        console.log(gamesList);

        res.json(gamesList);
    } catch (error) {
        console.log("Error fetching games list: ", error);
        res.status(500).json({ success: false, message: 'An error occurred when fetching games list' });
    }

});






module.exports = router;