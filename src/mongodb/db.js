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
        is_automatic_email_send: { type: Number },
        uid: { type: Number },
        body: { type: String },
        tag_id: { type: Array },
        default_tag: { type: String },
        imap_email: { type: String },
        genuine_applicant: { type: String },
        attachment: { type: Array },
        is_attachment: { type: Boolean },
        shedule_for: { type: String },
        shedule_date: { type: String },
        shedule_time: { type: String },
        push_message: { type: Array },
        push_status: { type: Boolean },
        registration_id: { type: Number }
    }, {
        collection: "emailStored",
        strict: true,
    });

    let userActivity = mongoose.Schema({}, {
        collection: 'userActivity',
        strict: false
    })

    let email = conn.model("EMAIL", emailSchema);
    let user_activity = conn.model('ACTIVITY', userActivity);

    cronService.cron(email)
    return function(req, res, next) {
        req.email = email;
        req.user_activity = user_activity;
        next();
    };
};