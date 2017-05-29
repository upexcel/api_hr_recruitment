var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
import config from "../config.json";

module.exports = {
    mail_alert: function(email, subject, template, from, html, callback) {
        var mailer = nodemailer.createTransport(smtpTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS
            }
        }));
        mailer.sendMail({
            from: from,
            to: email,
            subject: subject,
            template: "template",
            html: html
        }, function(error, response) {
            if (error) {
                callback("1", "messsage not send successfully");
            }
            callback("0", "messsage send successfully", response);
            mailer.close();
        });
    }
};
