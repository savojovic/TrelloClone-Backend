const express = require('express');
const app_key = express.Router();
const database = require('../../../database/database')

app_key.post('/',(req, res)=>{
    var key = req.query.app_key;
    var name = req.query.name;
    if(key.length==32){
        database.query(`INSERT INTO front_app (api_key, name, is_banned) VALUES ('${key}','${name}',false);`,
        (err, rows)=>{
            if(err)
                res.send(500);
            else{
                res.status(200);
                res.send(({app_key: key}))
            }
        })
    }else{
        res.status(401)
        res.send("Duzina mora biti 32 karaktera.")
    }
})

module.exports = app_key;