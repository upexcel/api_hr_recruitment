import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
module.exports = {
    mail_alert: function(email, subject, template, from, html, callback) {
        var mailer = nodemailer.createTransport(smtpTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "vaibhav_pathak@excellencetechnologies.in",
                pass: "VAibhav@1994"
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
