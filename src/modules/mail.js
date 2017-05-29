import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
module.exports = {
    mail_alert: function(email, subject, template, from, html, callback) {
        var mailer = nodemailer.createTransport(smtpTransport({
            // host: "smtp.sendgrid.net",
            // port: 25,
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "vaibhav_pathak@excellencetechnologies.in",
                pass: "VAibhav@1994"
                // user: "apikey",
                // pass: "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"
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
                callback("0", "messsage not send successfully");
            }
            callback("1", "messsage send successfully", response);
            mailer.close();
        });
    }
};
