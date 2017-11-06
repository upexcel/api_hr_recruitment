"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CronController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reminder = require("../service/reminder");

var _reminder2 = _interopRequireDefault(_reminder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var inbox = require("../inbox");
var CronJob = require("cron").CronJob;

var CronController = exports.CronController = function () {
    function CronController() {
        _classCallCheck(this, CronController);
    }

    _createClass(CronController, [{
        key: "cron",
        value: function cron(email, logs) {
            new CronJob("*/20 * * * *", function () {
                inbox.fetchEmail(email, logs) // running this function every 60 min
                .then(function (response) {
                    inbox.skippedDates(email, logs).then(function (data) {
                        inbox.beforeDateEmail(email, logs);
                    });
                });
            }, null, true);
        }
    }, {
        key: "reminder",
        value: function reminder(email, logs) {
            new CronJob('00 00 18 * * 1-7', function () {
                // cron is running every day at 06:00 PM
                _reminder2.default.reminderMail(email, logs).then(function (data) {
                    return console.log(data);
                });
            }, null, true);
        }
    }, {
        key: "PendingEmails",
        value: function PendingEmails(cron_service, logs, email) {
            new CronJob("*/1 * * * *", function () {
                _reminder2.default.sendEmailToPendingCandidate(cron_service, logs, email).then(function (response) {
                    _reminder2.default.sendEmailToNotRepliedCandidate(cron_service, logs, email).then(function (email_status) {
                        _reminder2.default.sendToSelected(cron_service, logs, email).then(function (selected_response) {
                            _reminder2.default.sendToAll(cron_service, logs, email).then(function (send_to_all_response) {
                                console.log(response, email_status, selected_response, send_to_all_response);
                            });
                        });
                    });
                });
            }, null, true);
        }
    }]);

    return CronController;
}();

var controller = new CronController();
exports.default = controller;
//# sourceMappingURL=cron.js.map