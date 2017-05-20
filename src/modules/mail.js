var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
module.exports = {
	mail_alert: function (email, subject, template, from, html, callback) {
		var mailer = nodemailer.createTransport(smtpTransport({
			host: "smtp.sendgrid.net",
			port: 25,
			auth: {
				user: "apikey",
				pass: "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"
			}
		}));
		mailer.sendMail({
			from: from,
			to: email,
			subject: subject,
			template: "template",
			html: html
		}, function (error, response) {
			if (error) {
				callback("1", "messsage not send successfully");
			}
			callback("0", "messsage send successfully", response);
			mailer.close();
		});
	}
};
