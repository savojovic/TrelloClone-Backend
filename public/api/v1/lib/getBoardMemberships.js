const database = require("../../../../database/database")

const util = require('util');
const query = util.promisify(database.query).bind(database);


getMemberships = async (boards_table) => {
    for (var board of boards_table) {
        console.log(board)
        memberships = await query(`SELECT distinct membership.* FROM
        (board join organization on organization_id_organization= id_organization)join membership on membership_id=membership.id 
        where board.id=${board.id}`);
        for (var id_or of memberships)
            delete id_or.organization_id_organization
        board["memberships"] = memberships;
    }
    return boards_table;
}

module.exports = getMemberships;