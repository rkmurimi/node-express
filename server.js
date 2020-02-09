/* Create express app
   creation of the express server(app)
*/
var express = require("express")
var app = express()

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


/* Default response for any other request
    defaults to HTTP 404 response (Not found)
*/
app.use(function(req,res){
    res.status(404);
});