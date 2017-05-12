var mongoose = require("mongoose");
var conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");
module.exports = {
	get_schema: function() {
               // create schema
		var emailSchema = mongoose.Schema({}, {
			collection: "emailStored",
			strict: false,
		});
		var email = conn.model("EMAIL", emailSchema);
		return email;
	}
};
