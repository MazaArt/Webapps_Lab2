//set up the server
const express = require( "express" );
const logger = require("morgan");
const app = express();
const port = 8080;

// define middleware that logs all incoming requests
app.use(logger("dev"));

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));

// define a route for the funny starting page (PayWall)
app.get( "/PayWall", ( req, res ) => {
    res.sendFile( __dirname + "/views/PayWall.html" );
} );

// define a route for the default home page 
app.get( "/", ( req, res ) => {
    res.sendFile( __dirname + "/views/index.html" );
} );

// define a route for the stuff inventory page
app.get( "/list", ( req, res ) => {
    res.sendFile( __dirname + "/views/list.html" );
} );

// define a route for the item detail page
app.get( "/list/practice", ( req, res ) => {
    res.sendFile( __dirname + "/views/practice.html" );
} );

// define a route for the payment page
app.get( "/ask", ( req, res ) => {
    res.sendFile( __dirname + "/views/askYourOwn.html" );
} );


// define a route for the payment page
app.get( "/pay", ( req, res ) => {
    res.sendFile( __dirname + "/views/payment.html" );
} );

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );