// the middleware function
module.exports = function() {
	var mongoose = require("mongoose"); //require mongoose module
	var conn = mongoose.connect("mongodb://localhost/EMAILPANEL"); //connection to mongodb

    // create schema
	var emailSchema = mongoose.Schema({}, {
		collection: "emailStored",
		strict: false,
	});
	var email = conn.model("EMAIL", emailSchema);
	return function(req, res, next) {
		req.email = email;
		next();
	};
};
