var mongoose = require("mongoose");
var conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");
var inbox = require("../inbox");
var CronJob = require("cron").CronJob;
// the middleware function
module.exports = function() {

    // create schema
    var emailSchema = mongoose.Schema({}, {
        collection: "emailStored",
        strict: false,
    });
    var email = conn.model("EMAIL", emailSchema);

    new CronJob("*/15 * * * *", function() {
        inbox.fetch_email(email); // running this function every 15 min
    }, null, true);
        inbox.Before_date_email(email,new Date());
    return function(req, res, next) {
        req.email = email;
        next();
    };
};