const express = require('express');
const register = express.Router();

var crypto = require('crypto');
var md5 = crypto.createHash('md5');//api key je javno dostupan, md5 generise 32bitni string

var database = require('../database/database');


register.post('/',(req, res)=>{
    var username = req.query.username;
    var passwordHash = crypto.createHash('sha256').update(req.query.password).digest('hex');
    database.query(`INSERT INTO member (username, password_hash) values ( "${username}", "${passwordHash}");        `,
        (err, rows)=>{
            if(err)
                res.sendStatus(404)
            else
                res.sendStatus(200)
        })
  })

module.exports = register;
