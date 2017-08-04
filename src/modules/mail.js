import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import config from "../config.js";
import emailExistence from "email-existence";
var helper = require('sendgrid').mail;

module.exports = {
    sendMail: function(email, subject, text, from, html) {
        return new Promise((resolve, reject) => {
            from = from.Instance ? from.Instance.dataValues : from.dataValues;
            var mailer = nodemailer.createTransport(smtpTransport({
                host: from.smtp_server,
                port: from.server_port,
                auth: {
                    user: from.email,
                    pass: from.password
                }
            }));
            emailExistence.check(email, function(err, res) {
                if (res) {
                    mailer.sendMail({
                        from: from,
                        to: email,
                        subject: subject,
                        template: text || "",
                        html: html
                    }, (error, response) => {
                        if (error) {
                            reject("messsage not send successfully");
                        } else {
                            resolve({ message: "messsage send successfully", status: 1 });
                        }
                        mailer.close();
                    });
                } else {
                    resolve({ message: "Invalid Email Details", status: 0 });
                }
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