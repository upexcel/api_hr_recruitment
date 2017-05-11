/*eslint-disable*/
var mongoose = require("mongoose"),
// create schema
emailSchema = new mongoose.Schema({
	email_id: { type: String, required: true, unique: true },
	to: { type: String },
	from: { type: String },
	sender_mail: { type: String },
	date: { type: String },
	email_date: { type: String },
	email_timestamp: { type: String },
	subject: { type: String },
	uid: { type: Number, required: true, unique: true },
	unread: { type: String },
	answered: { type: String },
	body: { type: String },
	attachment: { type: Array }
}, {
	collection: "emailStored",
	strict: true,
});
