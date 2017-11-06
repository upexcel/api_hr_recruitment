"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EmailLogs = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _imap = require("imap");

var _imap2 = _interopRequireDefault(_imap);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EmailLogs = exports.EmailLogs = function () {
    function EmailLogs() {
        _classCallCheck(this, EmailLogs);
    }

    _createClass(EmailLogs, [{
        key: "emailLog",
        value: function emailLog(log, data) {
            return new Promise(function (resolve, reject) {
                var logs = {};
                if (data && data.status) {
                    if (log.emailLogs) {
                        logs = new log.emailLogs({ email: data.email_response.envelope.to, from: data.email_response.envelope.from, time: new Date(), user: log.user.email, subject: data.subject, body: data.body });
                    } else {
                        logs = new log({ email: data.email_response.envelope.to, from: data.email_response.envelope.from, time: new Date(), user: "By Cron", subject: data.subject, body: data.body, tag_id: data.tag_id });
                    }
                    logs.save(function (err, result) {
                        if (!err) resolve("SUCCESS");else console.log(err);
                    });
                } else {
                    resolve("SUCCESS");
                }
            });
        }
    }]);

    return EmailLogs;
}();

var email_log = new EmailLogs();
exports.default = email_log;
//# sourceMappingURL=emaillogs.js.map