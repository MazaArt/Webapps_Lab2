//set up the server
const express = require( "express" );
const logger = require("morgan");
const db = require('./db/db_connection');
const app = express();
const port = 8080;
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

// define middleware that logs all incoming requests
app.use(logger("dev"));

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));

// define a route for the funny starting page (PayWall)
app.get( "/PayWall", ( req, res ) => {
    res.render("PayWall", data);
} );

const delete_item_sql = `
    DELETE 
    FROM
        Questions
    WHERE
        id = ?
`
app.get("/list/practice/:id/delete", ( req, res ) => {
    db.execute(delete_item_sql, [req.params.id], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/list");
        }
    });
})

// define a route for the default home page 
// app.get( "/", ( req, res ) => {
//     res.sendFile( __dirname + "/views/index.html" );
// } );

const read_list_all_sql = `
    SELECT 
        id, question, answer, creator
    FROM
        Questions
`

app.get( "/list", ( req, res ) => {
    db.execute(read_list_all_sql, (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.render('list', { inventory : results });
        }
    });
} );

const create_item_sql = `
    INSERT INTO Questions
        (question, answer, creator)
    VALUES
        (?, ?, ?)
`
app.post("/list", ( req, res ) => {
    db.execute(create_item_sql, [req.body.name, req.body.quantity], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            //results.insertId has the primary key (id) of the newly inserted element.
            res.redirect(`/list/practice/${results.insertId}`);
        }
    });
})

const update_item_sql = `
    UPDATE
        Questions
    SET
        question = ?,
        answer = ?,
        creator = ?
    WHERE
        id = ?
`
app.post("/list/practice/:id", ( req, res ) => {
    db.execute(update_item_sql, [req.body.name, req.body.quantity, req.body.description, req.params.id], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect(`/list/practice/${req.params.id}`);
        }
    });
})

// define a route for the stuff inventory page
app.get( "/index", ( req, res ) => {
    res.render("index", data);
} );

// define a route for the item detail page
const read_item_sql = `
    SELECT 
        id, question, answer, creator 
    FROM
        Questions
    WHERE
        id = ?
`
app.get( "/list/practice/:id", ( req, res, next ) => {
    db.execute(read_item_sql, [req.params.id], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else if (results.length == 0)
            res.status(404).send(`No item found with id = "${req.params.id}"` ); // NOT FOUND    
        else {
            let data = results[0];  // results is still an array
            res.render('item', data);
        }
    });
});


// define a route for the payment page
app.get( "/ask", ( req, res ) => {
    res.render("AskYourOwn", data);
} );


// define a route for the payment page
app.get( "/pay", ( req, res ) => {
    res.render("payment", data);
} );

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );
