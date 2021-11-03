var mysql = require('mysql')
var database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'trello'
})
database.connect();
module.exports = database