const express = require('express');
const list = express.Router();
const tokenVerifier = require('./lib/tokenVerifier');
const appKeyVerifier = require('./lib/appKeyVerifier');
const database = require("../../../database/database")
const util = require('util');
const query = util.promisify(database.query).bind(database);


list.get('/:list_id/cards', async (req, res) => {
    const listID = req.params.list_id;
    const appKey = req.query.key;
    const token = req.query.token;

    const tokenVerification = tokenVerifier(token);
    if (! await appKeyVerifier(appKey)) {
        res.status(401);
        res.send("APP KEY NOT ACCEPTED!")
    } else if (!tokenVerification.isVerified) {
        res.status(401);
        res.send(tokenVerification.message);
    }

    var cards = await query(`select * from card where idList=${listID};`);

    res.send(cards);
})
list.put('/:id', async (req, res) => {
    const appKey = req.query.key;
    const token = req.query.token;

    const tokenVerification = tokenVerifier(token);
    if (! await appKeyVerifier(appKey)) {
        res.status(401);
        res.send("APP KEY NOT ACCEPTED!")
    } else if (!tokenVerification.isVerified) {
        res.status(401);
        res.send(tokenVerification.message);
    }

    var listId = req.params.id;
    var listName = req.query.name;
    var listPos = req.query.pos;
    listName ? res.send(await query(`update trello_list set name='${listName}' where id='${listId}';`)) :
        res.send(await query(`update trello_list set pos='${listPos}' where id='${listId}'`));
    //var result = await query(`update trello_list set name='${listName}' where id='${listId}';`);
    //res.send(result);
})
list.post('/', async (req, res) => {
    const appKey = req.query.key;
    const token = req.query.token;
    const fields = req.query;
    delete fields.key;
    delete fields.token;
    const tokenVerification = tokenVerifier(token);
    if (! await appKeyVerifier(appKey)) {
        res.status(401);
        res.send("APP KEY NOT ACCEPTED!")
    } else if (!tokenVerification.isVerified) {
        res.status(401);
        res.send(tokenVerification.message);
    }
    var keys = '';
    var values = ''
    for (let [key, value] of Object.entries(fields)) {
        keys += `,${key}`;
        values += `,'${value}'`;
    }
    keys = keys.slice(1);
    values = values.slice(1);
    try {
        var newListId = (await query(`insert into trello_list (${keys}) values (${values})`)).insertId;
        res.send((await query(`select * from trello_list where id=${newListId}`))[0]);
    } catch (err) {
        if (err.sqlMessage == "Field 'idBoard' doesn't have a default value")
            res.send("Nedostaje idBoard");
        else
            res.send(500)
    }
    //res.send(result)
})
module.exports = list;


// SELECT * FROM card WHERE card.idList="${listID}"