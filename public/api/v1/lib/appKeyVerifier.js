const database = require("../../../../database/database")

const util = require('util');
const query = util.promisify(database.query).bind(database);

const isVerified = async (app_key) => {
    try {
        var response = await query(`SELECT is_banned FROM front_app WHERE api_key='${app_key}'`)
        if (!response[0] || response[0].is_banned == true) {
            return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = isVerified;