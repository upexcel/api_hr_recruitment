import mongoose from "mongoose";
let db = "hr_recruit_live"
if (process.env.NODE_ENV == "dev") {
    db = "hr_recruit_dev"
}
let conn = mongoose.createConnection("mongodb://localhost/" + db);
import cronService from "../service/cron.js";
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
        default_tag: { type: String },
        imap_email: { type: String },
        genuine_applicant: { type: String },
        attachment: { type: Array },
        is_attachment: { type: Boolean }
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
