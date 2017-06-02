import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import config from "../config.json";

module.exports = {
    sendMail: function(email, subject, template, from, html) {
        return new Promise((resolve, reject) => {
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
            }, (error, response) => {
                if (error) {
                    reject("messsage not send successfully");
                } else {
                    resolve({ messsage: response });
                }
                mailer.close();
            });
        })
    }
};
