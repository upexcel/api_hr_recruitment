var mongoose = require("mongoose");
var conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");
var DB = require("../inbox");
var CronJob = require("cron").CronJob;
// the middleware function
module.exports = function() {

	// create schema
	var emailSchema = mongoose.Schema({	}, {
		collection: "emailStored",
		strict: false,
	});
	var email = conn.model("EMAIL", emailSchema);

	// new CronJob("*/15 * * * *", function() {
		DB.get_schema(email); // running this function every 15 min
	// }, null, true);

	return function(req, res, next) {
		req.email = email;
		next();
	};
};
