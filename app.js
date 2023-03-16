//set up the server
const express = require( "express" );
const logger = require("morgan");
const db = require('./db/db_connection');
const { auth } = require('express-openid-connect');
const app = express();
const port = 8080;
const dotenv = require('dotenv');
dotenv.config();
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

// define middleware that logs all incoming requests
app.use(logger("dev"));

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
})

// define a route for the funny starting page (PayWall)
app.get( "/PayWall", ( req, res ) => {
    res.render("PayWall", data);
} );

// app.use(helmet({...}));

app.use(auth(config));

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
  });

app.get('/authtest', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  });

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
  };

const delete_item_sql = `
    DELETE 
    FROM
        Questions
    WHERE
        id = ?
    AND 
        creator = ?
`
app.get("/list/practice/:id/delete", requiresAuth(), ( req, res ) => {
    db.execute(delete_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
    WHERE 
        creator = ?
`

app.get( "/list", requiresAuth(), ( req, res ) => {
    db.execute(read_list_all_sql, [req.oidc.user.email], (error, results) => {
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
app.post("/list", requiresAuth(), ( req, res ) => {
    db.execute(create_item_sql, [req.body.name, req.body.quantity, req.oidc.user.email], (error, results) => {
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
    AND
        creator = ?
`
app.post("/list/practice/:id", ( req, res ) => {
    db.execute(update_item_sql, [req.body.name, req.body.quantity, req.body.description, req.params.id, req.oidc.user.email], (error, results) => {
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
    AND 
        creator = ?
`
app.get( "/list/practice/:id", requiresAuth(), ( req, res, next ) => {
    db.execute(read_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
app.get( "/ask", requiresAuth(), ( req, res ) => {
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
