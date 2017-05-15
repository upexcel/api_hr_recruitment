var mongoose = require("mongoose");
var conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");
var DB = require("../inbox");
module.exports = {
	get_schema: function() {
  // create schema
		var emailSchema = mongoose.Schema({}, {
			collection: "emailStored",
			strict: false,
		});
		var email = conn.model("EMAIL", emailSchema);
		DB.hello(email);
		return email;
	}
};

// // // the middleware function
// // module.exports = function() {
// // 	var mongoose = require("mongoose"); //require mongoose module
// // 	var conn = mongoose.connect("mongodb://localhost/EMAILPANEL"); //connection to mongodb
// //
// //     // create schema
// // 	var emailSchema = mongoose.Schema({}, {
// // 		collection: "emailStored",
// // 		strict: false,
// // 	});
// // 	var email = conn.model("EMAIL", emailSchema);
// // 	return function(req, res, next) {
// // 		req.email = email;
// // 		next();
// // 	};
// // };
