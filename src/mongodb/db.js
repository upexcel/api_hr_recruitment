var mongoose = require("mongoose");
var conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");
var DB = require("../inbox");
// the middleware function
module.exports = function() {

	  // create schema
	var emailSchema = mongoose.Schema({	}, {
		collection: "emailStored",
		strict: true,
	});
	var email = conn.model("EMAIL", emailSchema);
	DB.get_schema(email);
	return function(req, res, next) {
		req.email = email;
		next();
	};
};
