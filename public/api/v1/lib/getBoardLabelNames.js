const database = require("../../../../database/database")

const util = require('util');
const query = util.promisify(database.query).bind(database);



getLabelNames = async (boards) => {
    for (var board of boards) {
        var labels = await query(`SELECT * FROM label l WHERE l.board_id_board="${board.id}"`);
        for (var label of labels)
            delete label.board_id_board;
        board["labelNames"] = labels;
    }
    return boards
}

module.exports = getLabelNames;