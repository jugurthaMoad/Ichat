'use strict'

const mysql        = require('mysql');

const connection = mysql.createConnection({
host     : "localhost",
user     : "root",
password : "",
database : "Ichat"
});

connection.connect((err) => {
if(err) throw err;
console.log("Mysql Is Connected ... ");
});

module.exports = {
  connection
}
