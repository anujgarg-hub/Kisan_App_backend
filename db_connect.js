var mysql = require("mysql");
var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123",
  database: "policies_db",
});

pool.getConnection(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
module.exports = pool;
 