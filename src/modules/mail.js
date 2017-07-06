import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import config from "../config.json";
import emailExistence from "email-existence";

module.exports = {
    sendMail: function(email, subject, text, from, html) {
        return new Promise((resolve, reject) => {
            var mailer = nodemailer.createTransport(smtpTransport({
                host: config.SMTP_HOST,
                port: config.SMTP_PORT,
                auth: {
                    user: config.SMTP_USER,
                    pass: config.SMTP_PASS
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
    }
};
