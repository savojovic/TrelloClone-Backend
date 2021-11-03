const express = require('express');
const login = express.Router();


var crypto = require('crypto');//md5 32bita, sha256 64bita
var database = require('./database')



login.get('/', (req, res) => {
  var api_key = crypto.createHash('md5').update(req.query.password).digest('hex');
  console.log(api_key);
  database.query(`SELECT username, api_key from trello.user where username='${req.query.username}' and api_key='${api_key}'`,
    (err, rows, fields) => {
      if (rows[0]) {
        res.send(({ token: crypto.createHash('sha256').update(api_key).digest('hex') }));
      }
      else
        res.sendStatus(404)
    })
})

module.exports = login;