const express = require("express");
const router = express.Router();
const database = require("../../../database/database");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const util = require('util');
const query = util.promisify(database.query).bind(database);
const isValidAppKey = require("./lib/appKeyVerifier");
const list = require("./list");

dotenv.config();
const tokenSecret = process.env.TOKEN_SECRET;

router.get("/:userId/:id", async (req, res) => {
  const entity = req.params.userId;
  const ID = req.params.id;
  const fields = req.query.fields;
  const app_key = req.query.key;
  const token = req.query.token;

  if (!await isValidAppKey(app_key))
    res.send("Nevazeci APP_KEY.")
  else {//nije banovan, ima vazeci app_key
    var tokenInfo = verifyToken(token);
    if (tokenInfo.isVerified == false) {//token nije dobar
      res.status(401);
      res.send(tokenInfo.message);
    } else {
      if (entity == "me" && ID == "boards") {//provjeri da li je me
        var username = jwt.decode(token).username;
        var requestedData;
        try {
          if (fields || fields.includes(',')) {
            requestedData = await getRequiredInformation(username, fields.split(','));//sa poljima
            console.log(requestedData);
          }
        } catch (err) {
          requestedData = await getRequiredInformation(username);//bez polja
        }
        res.send(requestedData);
      } else if (entity != "me" && ID == "boards") {//ako je poslan upit za nekog korisnika po id-u
        //da li to treba da funkcionise, da li su te informacije javne??
      } else {
        res.sendStatus(404);
      }
    }
  }
});

getRequiredInformation = async (username, fields) => {
  var retObject = {};
  if (fields) {//sa poljima
    retObject = await asyncQuery(username, fields);
  } else {
    retObject = await asyncQuery(username);//bez polja
  }
  return retObject;
}
asyncQuery = async (username, fields) => {
  var parametarizedBoards = [];
  //dohvati sve iz board tabele

  var boards = await query(`select board.* from (board join user_has_board on board_id_board=id) join member on member_id_user=id_user where username='${username}'`);
  boards = JSON.parse(JSON.stringify(boards));

  await require('./lib/getBoardMemberships')(boards);
  await require('./lib/getBoardLabelNames')(boards);
  //await getTrelloLists(boards);

  if (fields) {//ako ima polja, filtriraj i vrati samo trazeno
    var count = 0;
    for (var board of boards) {
      parametarizedBoards[count] = {};
      for (var field of fields) {
        parametarizedBoards[count][field] = board[field];
      }
      count++;
    }
    return parametarizedBoards;
  }
  return boards;
};

getTrelloLists = async (boards) => {
  for (var board of boards) {
    var lists = await query(`SELECT * FROM trello_list WHERE trello_list.idBoard="${board.id}"`);
    board["lists"] = lists;
    console.log(lists);
  }
}
verifyToken = (token) => {
  var retValue = { isVerified: false, message: null };
  try {
    jwt.verify(token, tokenSecret);
    retValue.message = "OK";
  } catch (err) {
    retValue.message = err.message;
    retValue.isVerified = false;
    return retValue;
  }
  retValue.isVerified = true;
  return retValue;
};

module.exports = router;

///api/v1/members/me/boards?fields=name,url&key=APP_KEY&token=TOKEN