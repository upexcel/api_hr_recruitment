/*eslint-disable*/
var mongoose = require("mongoose"),
	Schema = mongoose.Schema;
module.exports = function() {
	var conn = mongoose.connect("mongodb://localhost/EMAILPANEL"); //connection to mongodb
    // create schema
	var schema = mongoose.Schema({}, {
		collection: "emailStored",
		strict: true,
	});
	var email_fetch = conn.model("emailStored", schema);
	return function(req, res, next) {
		req.email = email_fetch;
		next();
	};
};
