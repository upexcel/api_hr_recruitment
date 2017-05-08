var express = require('express'); //require express module
var app = express(); //creatig insatnce of express function
var mongoose = require('mongoose'); //require moongose module
var bodyParser = require('body-parser');
var db = require('./mongodb/db.js'); // create route for database
var routes = require('./routes/inbox.js'); //create route for index
var cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); //urlencoded within bodyParsar , extract data from <form> element
app.use(bodyParser.json());
app.use(db());

app.use('/', routes);
app.use(errorHandler);

function errorHandler(err, req, res, next) {
    if (err) {
        return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
}

// Listen to this Port
app.listen(8090, function() {
    console.log("Server started at port number: 8090");
});
