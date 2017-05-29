import mongoose from "mongoose";
let conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");
import cronService from "../service/cron.js";
// the middleware function
module.exports = function() {

    // create schema
    let emailSchema = mongoose.Schema({
        email_id: { type: String },
        from: { type: String },
        to: { type: String },
        sender_mail: { type: String },
        date: { type: String },
        email_date: { type: String },
        email_timestamp: { type: String },
        subject: { type: String },
        unread: { type: Boolean },
        answered: { type: Boolean },
        uid: { type: Number },
        body: { type: String },
        tag_id: { type: Number },
        genuine_applicant: { type: String },
        attachment: { type: String }
    }, {
        collection: "emailStored",
        strict: true,
    });
    let email = conn.model("EMAIL", emailSchema);

    cronService.cron(email)
    return function(req, res, next) {
        req.email = email;
        next();
    };
};
