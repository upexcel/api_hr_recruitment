import mongoose from "mongoose";
import config from "../config";
let db = config.mongodb;
if (!db) {
    console.log("Mongodb information is not fount update config details");
    process.exit(0)
}
let conn = 'mongodb://recruit-dev:java123@ds147265.mlab.com:47265/hr_recruit_dev';
conn = mongoose.connect(conn)

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
        shedule_date: { type: Date },
        shedule_time: { type: String },
        push_message: { type: Array },
        push_status: { type: Boolean },
        registration_id: { type: Number },
        mobile_no: { type: String },
        updated_time: { type: Date },
        send_template: { type: String },
        read_email_time: { type: Date },
        read_by_user: { type: String },
        reminder_send: { type: Boolean },
        send_template_count: { type: Number },
        template_id: { type: Array },
        notes: { type: Array },
        reply_to_id: { type: String }
    }, {
        collection: "emailStored",
        strict: true,
    });

    let userActivity = mongoose.Schema({}, {
        collection: 'userActivity',
        strict: false
    })
    let emailLogs = mongoose.Schema({
        email: { type: Array },
        from: { type: String },
        time: { type: Date },
        user: { type: String },
        subject: { type: String },
        body: { type: String },
        tag_id: { type: Array },
    }, {
        collection: 'emaillogs',
        strict: true
    })
    let cron_work = mongoose.Schema({}, {
        collection: 'cronWork',
        strict: false
    })

    let archive_emails = mongoose.Schema({}, {
        collection: 'archivedMails',
        strict: false
    })

    let email = conn.model("EMAIL", emailSchema);
    let user_activity = conn.model('ACTIVITY', userActivity);
    let email_logs = conn.model('EMAILLOGS', emailLogs);
    let cronWork = conn.model('CRONSTATUS', cron_work);
    let archivedMails = conn.model('ARCHIVED', archive_emails);

    cronService.cron(email, email_logs)
    cronService.reminder(email, email_logs)
    cronService.PendingEmails(cronWork, email_logs, email);

    return function(req, res, next) {
        req.email = email;
        req.user_activity = user_activity;
        req.emailLogs = email_logs;
        req.cronWork = cronWork;
        req.archived = archivedMails
        next();
    };
};