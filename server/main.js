const express = require("express");
const path = require("path");
const mysql = require("mysql");
const crypto = require("crypto");

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

var sqlConnection = mysql.createConnection({
    host:"localhost",
    user:"spider",
    password:"spider",
    database:"spiderInductions"
});

sqlConnection.connect(function(err) {
    if (err) {
        throw err;
    }
    else {
        console.log("sql: connection successful");
    }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "public/index.html"));
}); 

app.post("/getdata", (req,res)=>{
    let q;
    q = "SELECT users.username,balance FROM authentication_tokens,users WHERE token=" + req.body.token+ " AND users.username = authentication_tokens.username;";
    let ret = {};
    sqlConnection.query(q, (err,result) => {
        if (err) {
            res.status(500).send({status:0, message:"Internal server error!"});
            throw err;
        }
        else {
            ret.status = 1;
            ret.username = result[0].username;
            ret.balance = result[0].balance;
            ret.expenses = [];
            q = "SELECT * FROM expenses WHERE username=\"" + ret.username + "\" ORDER BY timestamp desc;";
            sqlConnection.query(q, (err, result) => {
                if (err) {
                    res.status(500).send({status:0, message:"Internal server error!"});
                    throw err;
                }
                else {
                    ret.expenses = result;
                    res.status(200).send(ret);
                }
            });
        }
    });
});

app.post("/addbalance", (req, res)=>{
    let token = req.body.token;
    let amount = req.body.amount;

    let q = "UPDATE users SET balance=balance + " + amount + " WHERE username = (SELECT username FROM authentication_tokens where token = " + token + ");";
    sqlConnection.query(q, (err, result) => {
        if (err) {
            res.status(500).send({status: 0, message: "Internal server error, please try again later."});
            throw err;
        }
        else {
            res.status(200).send({status:1, message: "Balance incremented successfully!"});
        }
    });
});

app.post("/addexpense", (req,res)=>{
    let token = req.body.token;
    let title = req.body.title;
    let desc = req.body.description;
    let amount = req.body.amount;

    q = "INSERT INTO expenses(username, title, description, amount) values (( select username from authentication_tokens";
    q += " where token = " + token + "), \"" + title + "\", \"" + desc + "\", " + amount + ");";

    sqlConnection.query(q, (err)=>{
        if (err) {
            res.status(500).send({status:0, message:"Internal server error, please try again later."});
            throw err;
        }
        else {
            let ret = {status:1};
            q = "SELECT * FROM expenses where username = (select username from";
            q += " authentication_tokens where token = " + token + ") ORDER BY timestamp desc;";
            sqlConnection.query(q, (err,result)=>{
                if (err) {
                    res.status(500).send({status:0, message:"Internal server error, please try again later!"});
                    throw err;
                }
                else {
                    ret.expenses = result;
                    res.status(200).send(ret);

                    q = "UPDATE users SET balance = balance - " + amount + " WHERE username = (SELECT username from authentication_tokens where token = " + token + ");";
                    sqlConnection.query(q);
                }
            })
        }
    });
}); 

app.post("/delexpense", (req, res)=>{
    let id = req.body.id;
    let token = req.body.token;

    let q = "DELETE FROM expenses WHERE id = " + id + " AND username = (SELECT username FROM authentication_tokens WHERE token = " + token + " );";
    sqlConnection.query(q, (err, result)=>{
        if(err) {
            res.status(500).send({status:0, message:"Internal server error, please try again later."});
            throw err;
        }
        else {
            let ret = {status:1};
            q = "SELECT * FROM expenses WHERE username = (SELECT username FROM authentication_tokens WHERE token = " + token + " );";
            sqlConnection.query(q, (err,result) => {
                if (err) {
                    res.status(500).send("Expenses deleted but could not fetch updated records.");
                    throw err;
                }
                else {
                    ret.expenses = result;
                    res.status(200).send(ret);
                }
            });
        }
    });
});

app.post("/createacc", function(req,res){
    if (checkSafePassword(req.body.password).length == 0 && checkSafeUsername(req.body.username).length == 0) {
        let q = "SELECT * FROM users WHERE username = \"" + req.body.username + "\";";
        sqlConnection.query(q, function(err, result) {
            if (err) {
                res.status(500).send({message:"Internal server error! Please try again later."});
                throw err;
            }
            else {
                if (result.length == 0) {
                    //creating new user
                    let u = req.body.username;
                    let p;
                    let c = crypto.createHmac("sha256", req.body.password);
                    p = c.digest("base64");
                    q = "INSERT INTO users (username, password) VALUES ?"; 
                    let values = [[u, p]];
                    sqlConnection.query(q, [values], (err,result) => {
                        if (err) {
                            res.status(500).send({message: "Internal server error! Please try again later."});
                            throw err;
                        } 
                        else {
                            res.status(201).send({message: "Account created successfully!"});
                        }
                    });
                }
                else {
                    res.status(409).send({message: "The username already exists!"});
                }
            }
        });
    }
    else {
        res.status(401).send({message: "Bad request!"});
    }
});

app.post("/login", (req,res)=>{
    let username = req.body.username;
    let password = req.body.password;

    if (checkSafePassword(password).length == 0 && checkSafeUsername(username).length == 0) {
        let c = crypto.createHmac("sha256", password);
        let passkey = c.digest("base64");

        let q = "SELECT * FROM users WHERE username=\"" + username + "\" AND password=\"" + passkey + "\";";
        sqlConnection.query(q, (err, result)=>{
            if (err) {
                res.status(501).send({status:0, message:"Internal server error! Please try again later."});
                throw err;
            }
            else {
                if (result.length == 0) {
                    res.status(400).send({status:0, message:"The username/password don't match. Please recheck credentials."});
                }
                else {
                    //generate token and send it back
                    //delete outdated tokens
                    q = "DELETE FROM authentication_tokens WHERE expiry < NOW();";
                    sqlConnection.query(q, (err)=>{
                        if (err) {
                            res.status(500).send({status:0, message:"Internal server error! Please try again later."});
                            throw err;
                        }
                    });

                    //check if token exists otherwise create one
                    q = "SELECT * FROM authentication_tokens WHERE username=\"" + username + "\";";
                    sqlConnection.query(q, (err,result)=>{
                        if (err) {
                            res.status(500).send({status:0, message:"Internal server error! Please try again later."});
                            throw err;
                        }
                        else {
                            if (result.length > 0) {
                                token = true;
                                res.status(200).send({status:1, message:"Login successfull!", token:result[0].token});
                            }
                            else {
                                q = "INSERT INTO authentication_tokens(username, expiry) VALUES (\"" + username + "\", DATE_ADD(NOW(), INTERVAL 1 DAY));" ;
                                sqlConnection.query(q, (err,result)=>{
                                    if (err) {
                                        res.status(500).send({status:0, message:"Internal server error! Please try again later."});
                                        throw err;
                                    }
                                    else {
                                        console.log(result);
                                        res.status(200).send({status:1, message:"Login successful!", token:result.insertId});
                                    }
                                });
                            }
                        }
                    }); 
                }
            }
        }) ;
    }
    else {
        res.status(401).send({status: 0, message: "Invalid credentials."});
    }
});

app.post("/verifytoken", (req,res)=>{
    let token = req.body.token;
    let q = "SELECT * FROM authentication_tokens WHERE token=" + token + ";";
    let clear = "DELETE FROM authentication_tokens WHERE expiry < NOW();";
    sqlConnection.query(clear, (err)=>{
        if (err) {
            res.status(500).send({verified: false, status: 0, message: "Internal server error! Please try again later."});
            throw err;
        }
        else {
            sqlConnection.query(q, (err, result)=>{
                if (err) {
                    res.status(500).send({verified: false, status: 0, message: "Internal server error! Please try again later."});
                    throw err;
                }
                else {
                    if (result.length > 0) {
                        res.status(200).send({verified:true, status:1, message:"Client verified!"});
                    }
                    else {
                        res.status(400).send({verified:false, status:0, message:"Token does not exist!"});
                    }
                }
            });
        }
    });
});

app.listen(3000, function() {
    console.log("Listening at port 3000");
});

function checkSafePassword(pass) {
    var errors = [];
    if (pass.length < 8) {
        errors.push("The password must have at least 8 characters.");
    }
    if (pass.search(/[A-Z]/) < 0) {
        errors.push("The password must have at least one uppercase character.");
    }
    if (pass.search(/[\d]/) < 0) {
        errors.push("The password must have at least one digit");
    }
    if (pass.search(/["'/\\?*]/) >= 0) {
        errors.push("The password contains illegal characters.");
    }
    return errors;
}

function checkSafeUsername(username) {
    var errors = [];
    if (username.length < 8) {
        errors.push("The username must contain at least 8 characters.");
    } 
    if (username.search(/["'/\\?*]/) >= 0) {
        errors.push("The username contains illegal characters.");
    }
    return errors;
}