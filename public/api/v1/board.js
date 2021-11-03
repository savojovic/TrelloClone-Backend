const express = require('express');
const board = express.Router();
const database = require("../../../database/database")
const util = require('util');
const query = util.promisify(database.query).bind(database);
const getMemberships = require('./lib/getBoardMemberships');
const getLabelNames = require('./lib/getBoardLabelNames');
const verifyAppKey = require('./lib/appKeyVerifier');
const verifyToken = require('./lib/tokenVerifier');
const jwt = require("jsonwebtoken");

board.get('/:board_id', async (req, res) => {
    const fields = req.query.fields;
    const app_key = req.query.key;
    const token = req.query.token;
    const isTokenVerified = verifyToken(token);
    if (!await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }

    var board = [{ id: req.params.board_id }];
    board = await query(`SELECT distinct * FROM board WHERE board.id="${board[0].id}"`);
    await getMemberships(board);
    await getLabelNames(board);
    if (fields) {
        var resultBoard = {};
        for (var field of fields.split(',')) {
            resultBoard[field] = board[0][field];
            //console.log(resultBoard)
        }
        res.send(resultBoard)
    }
    res.send(board)
})
board.post('/', async (req, res) => {
    var app_key = req.query.key;
    var token = req.query.token;
    var name = req.query.name;

    const isTokenVerified = verifyToken(token);
    if (!await (verifyAppKey(app_key))) {
        res.statusCode = 401;
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!isTokenVerified.isVerified) {
        res.send(isTokenVerified.message);
    }

    var username = jwt.decode(token).username;
    try {
        var id = await query(`select id_user from member where username='${username}'`)
        var board = await query(`insert into board (name) values('${name}')`)
        var result = await query(`insert into user_has_board (member_id_user, board_id_board) values(${id[0].id_user},${board.insertId})`)
        var newBoard = await query(`select * from board where id=${board.insertId}`);
        res.send(newBoard[0])
    } catch (error) {
        res.send(error.message)
    }

})
board.get('/:id/lists', async (req, res) => {

    var boardID = req.params.id;
    const appKey = req.query.key;
    const token = req.query.token;
    const tokenVerification = verifyToken(token);
    //console.log("msg:" + tokenVerification.isVerified);
    if (!await verifyAppKey(appKey)) {
        res.status(401);
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!tokenVerification.isVerified) {
        res.status(401);
        res.send(tokenVerification.message);
    }
    var resp = await query(`SELECT * FROM trello_list WHERE trello_list.idBoard="${boardID}"`);
    res.send(resp)
})
board.get('/:id/cards', async (req, res) => {
    const boardID = req.params.id;
    const appKey = req.query.key;
    const token = req.query.token;

    const tokenVerification = verifyToken(token);
    if (!await verifyAppKey(appKey)) {
        res.status(401);
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!tokenVerification.isVerified) {
        res.status(401);
        res.send(tokenVerification.message);
    }
    var listOfCards = await query(`SELECT card.* FROM ((board JOIN trello_list ON board.id=trello_list.idBoard) 
                                    JOIN card ON trello_list.id=card.idList) WHERE idBoard="${boardID}"`)
    res.send(listOfCards);
})
board.put('/:id', async (req, res) => {
    const boardId = req.params.id;
    const appKey = req.query.key;
    const token = req.query.token;
    const name = req.query.name;

    const tokenVerification = verifyToken(token);
    if (!await verifyAppKey(appKey)) {
        res.status(401);
        res.send("APP KEY NOT ACCEPTED!");
    } else if (!tokenVerification.isVerified) {
        res.status(401);
        res.send(tokenVerification.message);
    }

    await query(`UPDATE board SET name = '${name}' WHERE (id = '${boardId}')`);//update board
    const newBoard = await query(`select * from board where id='${boardId}'`);

    res.send(newBoard[0])
})

board.put('/:id/members', async (req, res) => {
    const boardId = req.params.id;
    const appKey = req.query.key;
    const token = req.query.token;
    const username = req.query.username;

    var memberId = await query(`select id_user from member where username='${username}'`);
    await query(`insert into user_has_board (member_id_user, board_id_board)values(${memberId[0].id_user},${boardId})`)

    res.send(username + boardId);
})
module.exports = board;

//board_id -> idBoard