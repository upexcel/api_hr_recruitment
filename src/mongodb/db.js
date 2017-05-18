var mongoose = require("mongoose");
var conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");
var DB = require("../inbox");
var CronJob = require("cron").CronJob;
// the middleware function
module.exports = function() {
    // create schema
	var emailSchema = mongoose.Schema({}, {
		collection: "emailSave",
		strict: false,
	});
	var email = conn.model("EMAIL", emailSchema);

	new CronJob("*/15 * * * *", function() {
		console.log("You will see this message every second");
	}, null, true, "America/Los_Angeles");
	DB.get_schema(email);
	return function(req, res, next) {
		req.email = email;
		next();
	};
};
