"use strict";

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    findEmail: function findEmail(mail) {
        return new Promise(function (resolve, reject) {
            var from = void 0,
                to = void 0,
                sender_mail = void 0,
                date = void 0,
                email_date = void 0,
                email_timestamp = void 0,
                subject = void 0;
            from = mail.from.value[0].name;
            to = mail.to.value[0].address;
            date = mail.date;
            email_date = mail.date;
            email_timestamp = new Date(mail.date).getTime();
            subject = mail.subject;
            if (mail.subject.substring(0, 3) == "Fwd" && mail.from.value[0].address.slice(-26) == "@excellencetechnologies.in") {
                var email_ids = mail.text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                var fwdedFrom = mail.text.split("\n");
                var name = fwdedFrom[1].split(fwdedFrom[1].split(" ")[0] + " ")[1].split(" " + "<" + email_ids[0] + ">")[0];
                sender_mail = email_ids[0];
                var data = {
                    from: name,
                    to: to,
                    sender_mail: sender_mail,
                    date: date,
                    email_date: email_date,
                    email_timestamp: email_timestamp,
                    subject: subject
                };
                resolve(data);
            } else {
                sender_mail = mail.from.value[0].address;
                var _data = {
                    from: from,
                    to: to,
                    sender_mail: sender_mail,
                    date: date,
                    email_date: email_date,
                    email_timestamp: email_timestamp,
                    subject: subject
                };
                resolve(_data);
            }
        });
    }
};
//# sourceMappingURL=forwardedemail.js.map