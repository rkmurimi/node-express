/* Create express app
   creation of the express server(app)
*/
var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require('md5');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Server port
Definition of a local server port(HTTP_PORT)
*/
var HTTP_PORT = 8000

// Start server
app.listen(HTTP_PORT, ()=>{
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

/* Root Endpoint
    A response for the root endpoint
*/

app.get("/", (req, res, next) =>{
    res.json({"message":"OK"})
});

// Insert here other API endpoints
//Get a List of users
app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//Get a single user by id
app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

//Create a new user POST
app.post("/api/user/", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

/*
---- Update a user
    We use the PATCH method (app.patch()),  an endpoint with a variable expression (:id), 
    mapped to a variable in req.params (req.params.id)
    Since each field could be empty (not updated), we use COALESCE function to keep 
    the current value if there is no new value (null). 
    We use a classical callback function to get access to this.changes (the number of rows updated).
    You can use this number if you need to verify if the row was modified 
    or not (same original data), to trigger a UI update, for example.

*/ 
app.patch("/api/user/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null
    }
    db.run(
        `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

//Delete an user
/*
    In this case, we use app.delete() and a variable expression (:id)  
    to map the user id of the request.
    Then, we run a DELETE command filtered by the user id (req.params.id)
    If everything is ok, we return a JSON response, 
    including the number of rows affected (changes). 
    If the user was already deleted, or the id was not found, the value will be 0.
*/

app.delete("/api/user/:id", (req, res, next) => {
    db.run(
        'DELETE FROM user WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

/* Default response for any other request
    defaults to HTTP 404 response (Not found)
*/
app.use(function(req,res){
    res.status(404);
});