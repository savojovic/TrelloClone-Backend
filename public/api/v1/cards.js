const express = require("express");
const router = express.Router();
const verifyAppKey = require('./lib/appKeyVerifier');
const verifyToken = require('./lib/tokenVerifier');
const database = require("../../../database/database")
const util = require('util');
const dbQuerry = util.promisify(database.query).bind(database);


router.get('/:id/comments', async (req, res) => {
    const app_key = req.query.key;
    const token = req.query.token;
    const isTokenVerified = verifyToken(token);
    const idCard = req.params.id;


    if (app_key && !await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }

    const result = await dbQuerry(
        `select username, text from (member join comment on member_id_user=id_user) join card on card.id=idCard
         where idCard='${idCard}'`)
    res.send(result);
})

router.post('/:id/actions/comments', async (req, res) => {
    const app_key = req.query.key;
    const token = req.query.token;
    const comment = req.query.text;
    const isTokenVerified = verifyToken(token);
    const idCard = req.params.id;

    if (app_key && !await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }

    const username = isTokenVerified.username;
    const userId = await dbQuerry(`select id_user from member where username='${username}'`);
    await dbQuerry(`insert into comment (text, idCard, member_id_user) values('${comment}','${idCard}','${userId[0].id_user}')`);

    res.send(200)
})

router.get('/:id', async (req, res) => {
    const app_key = req.query.key;
    const token = req.query.token;
    const isTokenVerified = verifyToken(token);
    const idCard = req.params.id;

    if (app_key && !await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }
    var result = await dbQuerry(`select * from card where id=${idCard}`)
    res.send(result);
})

router.delete('/:id', async (req, res) => {
    const app_key = req.query.key;
    const token = req.query.token;
    const isTokenVerified = verifyToken(token);
    const idCard = req.params.id;

    if (app_key && !await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }
    var result = await dbQuerry(`delete from card where id=${idCard}`);
    var limits = { limits: {} }
    res.send(limits);
})

router.post('/', async (req, res) => {
    const app_key = req.query.key;
    const token = req.query.token;
    var fields = req.query;
    delete fields.key;
    delete fields.token;
    const isTokenVerified = verifyToken(token);
    if (app_key && !await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }
    var keys = '';
    var values = ''
    for (let [key, value] of Object.entries(fields)) {
        keys += `,${key}`;
        values += `,'${value}'`;
    }
    keys = keys.slice(1);
    values = values.slice(1);
    var querry = `INSERT INTO card (${keys}) VALUES (${values});`;

    var newCardId = (await dbQuerry(querry)).insertId;
    res.send((await dbQuerry(`select * from card where id=${newCardId}`))[0]);
})

router.put('/:id', async (req, res) => {
    const cardId = req.params.id;
    const app_key = req.query.key;
    const token = req.query.token;
    var fields = req.query;
    delete fields.key;
    delete fields.token;
    delete fields.id;
    const isTokenVerified = verifyToken(token);
    if (app_key && !await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }
    if (fields) {
        var card = await dbQuerry(`select * from card where card.id='${cardId}'`);
        var querrySetPart = "";
        for (let [key, value] of Object.entries(fields)) {
            card[0][key] = value;
            querrySetPart += `,\`${key}\`='${value}'`;
        }
        querrySetPart = querrySetPart.slice(1);
        var querry = `UPDATE card SET ${querrySetPart} where \`id\`='${cardId}'`;
        var result = await database.query(querry);
        //console.log(result); TODO: vidjeti sta je u ovom objektu indikator da je transakcija uspjesna, pa vratiti novi ili stari cards
        res.send(card);
    }
})

module.exports = router;