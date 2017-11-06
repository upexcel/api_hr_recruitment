"use strict";

var _nodemailer = require("nodemailer");

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _nodemailerSmtpTransport = require("nodemailer-smtp-transport");

var _nodemailerSmtpTransport2 = _interopRequireDefault(_nodemailerSmtpTransport);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _emailExistence = require("email-existence");

var _emailExistence2 = _interopRequireDefault(_emailExistence);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var helper = require('sendgrid').mail;

module.exports = {
    sendMail: function sendMail(email, subject, text, from, html, automatic) {
        return new Promise(function (resolve, reject) {
            html += (0, _constant2.default)().add_html_suffix_email_tracking + "&tid=" + process.env.TRACKING_ID || _config2.default.TRACKING_ID + "&cid=" + process.env.CLIENT_ID || _config2.default.CLIENT_ID + "&t=event&ec=" + subject + "_  " + (0, _moment2.default)().format("YYYY-MM-DD") + "&ea=open&el=" + email + "\"/>";
            if (!from.email) from = from.Instance || from.data ? from.Instance.dataValues : from.dataValues;
            var mailer = _nodemailer2.default.createTransport((0, _nodemailerSmtpTransport2.default)({
                host: from.smtp_server,
                port: parseInt(from.server_port),
                auth: {
                    user: from.username,
                    pass: from.password
                }
            }));
            var domain_name = from.email.replace(/.*@/, "");
            var name = from.email.replace(/@[^@]+$/, '');
            var unique_id = name + ("+" + Math.random().toString(36).substr(2, 9) + "@") + domain_name;

            mailer.sendMail({
                from: from.email,
                to: email,
                subject: subject,
                template: text || "",
                html: html,
                replyTo: automatic ? unique_id : from.email
            }, function (error, response) {
                if (error) {
                    reject("Invalid Smtp Information");
                } else {
                    resolve({ message: "messsage send successfully", status: 1, email_response: response, subject: subject, body: html, reply_to: unique_id });
                }
                mailer.close();
            });
        });
    },

    sendUsingSendGrid: function sendUsingSendGrid(to_emails, subject, html, from, body) {
        return new Promise(function (resolve, reject) {
            var sg = require('sendgrid')(_config2.default.SMTP_PASS);
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: {
                    personalizations: [{
                        to: to_emails,
                        subject: subject
                    }],
                    send_at: Math.floor(new Date().getTime() / 1000 + 60),
                    from: {
                        email: from
                    },
                    content: [{
                        type: 'text/plain',
                        value: body
                    }]
                }
            });

            sg.API(request, function (error, response) {
                if (error) {
                    console.log('Error response received');
                }
                resolve({ message: "messsage send successfully", status: 1 });
            });
        });
    },

    sendScheduledMail: function sendScheduledMail(email, subject, text, from, html) {
        return new Promise(function (resolve, reject) {
            html += (0, _constant2.default)().add_html_suffix_email_tracking + "&tid=" + process.env.TRACKING_ID || _config2.default.TRACKING_ID + "&cid=" + process.env.CLIENT_ID || _config2.default.CLIENT_ID + "&t=event&ec=" + subject + "_  " + (0, _moment2.default)().format("YYYY-MM-DD") + "&ea=open&el=" + email + "\"/>";
            console.log(html);
            if (!from.email) from = from.Instance || from.data ? from.Instance.dataValues : from.dataValues;
            var mailer = _nodemailer2.default.createTransport((0, _nodemailerSmtpTransport2.default)({
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
                cc: (0, _constant2.default)().app_hr_contact_email,
                bcc: (0, _constant2.default)().admin_mail
            }, function (error, response) {
                if (error) {
                    reject("Invalid Smtp Information");
                } else {
                    resolve({ message: "messsage send successfully", status: 1, email_response: response, subject: subject, body: html });
                }
                mailer.close();
            });
        });
    }
};
//# sourceMappingURL=mail.js.map