const express = require('express');
const token = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const database = require('../../../database/database')

var crypto = require('crypto');//md5 32bita, sha256 64bita


dotenv.config();
const tokenSecret = process.env.TOKEN_SECRET;


token.post('/', (req, res) => {
    var passwordHash = req.query.password;
    console.log("test")
    console.log(`SELECT username, password_hash from trello.member where username='${req.query.username}' and password_hash='${passwordHash}'`)
    database.query(`SELECT username, password_hash from trello.member where username='${req.query.username}' and password_hash='${passwordHash}'`,
        (err, rows) => {
            if (err)
                res.sendStatus(404)
            else if (rows[0]) {
                const token = jwt.sign({ username: req.query.username }, tokenSecret, { expiresIn: '12h' });
                res.send(({ token: token }));
            }
            else
                res.sendStatus(404)
        })
})
module.exports = token;