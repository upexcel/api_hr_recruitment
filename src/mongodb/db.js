import mongoose from "mongoose";
import cronService from "../service/cron.js";
let conn = mongoose.createConnection("mongodb://localhost/EMAILPANEL");

// the middleware function
module.exports = function() {

    // create schema
    let emailSchema = mongoose.Schema({
        email_id: { type: Number },
        from: { type: String },
        to: { type: String },
        sender_mail: { type: String },
        date: { type: Date },
        email_date: { type: Date },
        email_timestamp: { type: String },
        subject: { type: String },
        unread: { type: Boolean },
        answered: { type: Boolean },
        uid: { type: Number },
        body: { type: String },
        tag_id: { type: Array },
        imap_email: { type: String },
        genuine_applicant: { type: String },
        attachment: { type: Array }
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
