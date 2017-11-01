import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import config from "../config";
import emailExistence from "email-existence";
import constant from "../models/constant";
import moment from "moment";
let helper = require('sendgrid').mail;

module.exports = {
    sendMail: function(email, subject, text, from, html) {
        return new Promise((resolve, reject) => {
            html += constant().add_html_suffix_email_tracking + "&tid=" + config.TRACKING_ID + "&cid=" + config.CLIENT_ID + "&t=event&ec=" + subject + "_  " + moment().format("YYYY-MM-DD") + "&ea=open&el=" + email + "\"/>";
            console.log(html)
            if (!from.email)
                from = (from.Instance || from.data) ? from.Instance.dataValues : from.dataValues;
            let mailer = nodemailer.createTransport(smtpTransport({
                host: from.smtp_server,
                port: parseInt(from.server_port),
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
                    console.log(response)
                    resolve({ message: "messsage send successfully", status: 1, email_response: response, subject: subject, body: html });
                }
                mailer.close();
            });
        })
    },
    sendScheduledMail: function(email, subject, text, from, html) {
        return new Promise((resolve, reject) => {
            html += constant().add_html_suffix_email_tracking + "&tid=" + config.TRACKING_ID + "&cid=" + config.CLIENT_ID + "&t=event&ec=" + subject + "_  " + moment().format("YYYY-MM-DD") + "&ea=open&el=" + email + "\"/>";
            console.log(html)
            if (!from.email)
                from = (from.Instance || from.data) ? from.Instance.dataValues : from.dataValues;
            let mailer = nodemailer.createTransport(smtpTransport({
                host: from.smtp_server,
                port: parseInt(from.server_port),
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
                html: html,
                cc: constant().app_hr_contact_email,
                bcc:constant().admin_mail
            }, (error, response) => {
                if (error) {
                    reject("Invalid Smtp Information");
                } else {
                    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                    console.log(response)
                    resolve({ message: "messsage send successfully", status: 1, email_response: response, subject: subject, body: html });
                }
                mailer.close();
            });
        })
    }
};