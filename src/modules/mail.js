import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import config from "../config";
import emailExistence from "email-existence";
var helper = require('sendgrid').mail;

module.exports = {
    sendMail: function(email, subject, text, from, html) {
        return new Promise((resolve, reject) => {
            if (!from.email)
                from = (from.Instance || from.data) ? from.Instance.dataValues : from.dataValues;
            console.log(from.email)
            var mailer = nodemailer.createTransport(smtpTransport({
                host: from.smtp_server,
                port: from.server_port,
                auth: {
                    user: from.username,
                    pass: from.password
                }
            }));
            mailer.sendMail({
                from: from.email,
                to: email,
                subject: subject,
                template: text || "",
                html: html
            }, (error, response) => {
                if (error) {
                    reject("Invalid Smtp Information");
                } else {
                    resolve({ message: "messsage send successfully", status: 1, email_response: response, subject: subject, body: html });
                }
                mailer.close();
            });
        })
    },
    sendUsingSendGrid: function(to_emails, subject, html, from, body) {
        return new Promise((resolve, reject) => {
            var sg = require('sendgrid')(config.SMTP_PASS);
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: {
                    personalizations: [{
                        to: to_emails,
                        subject: subject
                    }],
                    send_at: Math.floor((new Date().getTime() / 1000) + 60),
                    from: {
                        email: from
                    },
                    content: [{
                        type: 'text/plain',
                        value: body
                    }],
                }
            });

            sg.API(request, function(error, response) {
                if (error) {
                    console.log('Error response received');
                }
                resolve({ message: "messsage send successfully", status: 1 });
            });
        })
    }
};