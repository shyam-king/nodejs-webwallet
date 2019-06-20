const express = require("express");
const path = require("path");
const mysql = require("mysql");

var app = express();
var sqlConnection = mysql.createConnection({
    host:"localhost",
    user:"spider",
    password:"spider"
});

sqlConnection.connect(function(err) {
    if (err) {
        throw err;
    }
    else {
        console.log("sql: connection successful");
    }

    sqlConnection.query("use spiderInductions;", function(err, result) {
        if (err) 
            throw err;
        else {
            console.log("sql: using database spiderInductions.");
        }
    });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "public/index.html"));
}); 

app.listen(3000, function() {
    console.log("Listening at port 3000");
});