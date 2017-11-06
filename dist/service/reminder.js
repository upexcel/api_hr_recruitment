'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _constant = require('../models/constant');

var _constant2 = _interopRequireDefault(_constant);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _mail = require('../modules/mail');

var _mail2 = _interopRequireDefault(_mail);

var _replaceVariable = require('../modules/replaceVariable');

var _replaceVariable2 = _interopRequireDefault(_replaceVariable);

var _db = require('../db');

var _db2 = _interopRequireDefault(_db);

var _emaillogs = require('./emaillogs.js');

var _emaillogs2 = _interopRequireDefault(_emaillogs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reminderMail = function reminderMail(email, logs) {
    return new Promise(function (resolve, reject) {
        var dateTime = new Date();
        var start = (0, _moment2.default)(dateTime).format("YYYY-MM-DD"); //currnet date 
        var end = (0, _moment2.default)(start).add(1, 'days').format("YYYY-MM-DD"); // next date
        var id_list = [];
        email.find({ shedule_date: { "$gte": start, "$eq": end } }, { "shedule_date": 1, "shedule_time": 1, "tag_id": 1, "from": 1, "send_template": 1, "sender_mail": 1 }).exec(function (err, response) {
            if (response.length) {
                sendReminder(response, function (reminder_status) {
                    email.update({ "_id": { "$in": body.mongo_id } }, { reminder_send: 1 }, { multi: true }).exec(function (err, update_response) {
                        if (!err) {
                            resolve(reminder_status);
                        }
                    });
                });
            } else {
                resolve("No email is sheduled for tomorrow");
            }
        });

        function sendReminder(mail_data, callback) {
            // function for sending reminder
            var user_info = mail_data.splice(0, 1)[0];
            id_list.push(user_info._id);
            _db2.default.Template.findById(parseInt(user_info.send_template)) // finding template that is send to candiadte
            .then(function (template_data) {
                _replaceVariable2.default.filter(template_data.body, user_info.from, user_info.tag_id[0]) // replace user variables
                .then(function (replaced_data) {
                    _db2.default.Smtp.findOne({ where: { status: 1 } }).then(function (smtp) {
                        var subject = (0, _constant2.default)().reminder + " " + (0, _moment2.default)(user_info.shedule_date).format("YYYY-MM-DD") + " at " + user_info.shedule_time; // subject for remonder email
                        _mail2.default.sendMail(user_info.sender_mail, subject, "", smtp, replaced_data) // sending email
                        .then(function (mail_response) {
                            mail_response['user'] = "Reminder";
                            _emaillogs2.default.emailLog(logs, mail_response).then(function (mail_log) {
                                if (mail_data.length) {
                                    sendReminder(mail_data, callback);
                                } else {
                                    callback({ message: "Reminder Sent To Selected Users" });
                                }
                            });
                        });
                    });
                });
            });
        }
    });
};

var sendEmailToPendingCandidate = function sendEmailToPendingCandidate(cron_service, logs, email) {
    return new Promise(function (resolve, reject) {
        cron_service.findOne({ status: 1, work: (0, _constant2.default)().pending_work }).exec(function (err, cronWorkData) {
            if (cronWorkData && cronWorkData.get('candidate_list').length) {
                _db2.default.Smtp.findOne({ where: { status: 1 } }).then(function (smtp) {
                    _db2.default.Template.findById(cronWorkData.get('template_id')).then(function (template) {
                        email.find({ _id: cronWorkData.get('candidate_list')[0]._id, "$or": [{ is_automatic_email_send: 0 }, { is_automatic_email_send: { "$exists": false } }] }, { "_id": 1, "sender_mail": 1, "from": 1, "is_automatic_email_send": 1, "subject": 1 }).exec(function (err, result) {
                            if (result) {
                                sendTemplateToEmails(cronWorkData.get('candidate_list')[0], template, smtp, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(data);
                                    }
                                });
                            } else {
                                cron_service.update({ _id: cronWorkData.get('_id') }, { $pull: { candidate_list: cronWorkData.get('candidate_list')[0] } }).exec(function (err, updated_cronWork) {
                                    if (!err) {
                                        console.log(updated_cronWork);
                                        resolve("Email Sent To candidate");
                                    }
                                });
                            }
                        });
                    });

                    function sendTemplateToEmails(emails, template, smtp, callback) {
                        var subject = "";
                        console.log(emails);
                        if (!smtp) {
                            callback("Not active Smtp", null);
                        }
                        var email_id = emails;
                        _replaceVariable2.default.filter(template.body, email_id.from, emails.tag_id).then(function (html) {
                            subject = template.subject;
                            _mail2.default.sendMail(email_id.sender_mail, subject, (0, _constant2.default)().smtp.text, smtp, html, true).then(function (response) {
                                response['user'] = cronWorkData.get('user');
                                response['tag_id'] = emails.tag_id;
                                _emaillogs2.default.emailLog(logs, response).then(function (log_response) {
                                    email.update({ "_id": email_id._id }, { is_automatic_email_send: 1, send_template_count: 1, template_id: [template.id], reply_to_id: response.reply_to }).then(function (data1) {
                                        cron_service.update({ _id: cronWorkData.get('_id') }, { "$pull": { candidate_list: emails } }).exec(function (err, updated_cronWork) {
                                            if (!err) {
                                                console.log(updated_cronWork);
                                                callback(null, "email sent to pending candidate");
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            } else {
                cron_service.findOneAndUpdate({ status: 1, work: (0, _constant2.default)().pending_work }, { $set: { status: 0 } }).exec(function (err, update_status) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve("Nothing in Pending");
                    }
                });
            }
        });
    });
};

var sendEmailToNotRepliedCandidate = function sendEmailToNotRepliedCandidate(cron_service, logs, email) {
    return new Promise(function (resolve, reject) {
        cron_service.findOne({ status: 1, work: (0, _constant2.default)().not_replied }).then(function (cronWorkData) {
            if (cronWorkData && cronWorkData.get('candidate_list').length) {
                _db2.default.Smtp.findOne({ where: { status: 1 } }).then(function (smtp) {
                    sendTemplateToEmails(cronWorkData, smtp, function (err, response) {
                        resolve("SUCCESS");
                    });

                    function sendTemplateToEmails(cronWorkData, smtp, callback) {
                        var subject = cronWorkData.get('subject');
                        var candidate_info = cronWorkData.get("candidate_list")[0];
                        if (!smtp) {
                            callback("Not active Smtp", null);
                        }
                        _replaceVariable2.default.filter(cronWorkData.get('body'), candidate_info.from, cronWorkData.tag_id).then(function (html) {
                            _mail2.default.sendMail(candidate_info.sender_mail, subject, (0, _constant2.default)().smtp.text, smtp, html).then(function (mail_response) {
                                _emaillogs2.default.emailLog(logs, mail_response).then(function (log_response) {
                                    email.update({ _id: candidate_info._id }, { $inc: { send_template_count: 1 }, $push: { template_id: parseInt(cronWorkData.get('template_id')) }, is_automatic_email_send: 1 }).then(function (response) {
                                        cron_service.findOneAndUpdate({ _id: cronWorkData._id }, { "$pull": { candidate_list: candidate_info } }).then(function (updated_cronWork) {
                                            callback(null, updated_cronWork);
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            } else {
                cron_service.findOneAndUpdate({ status: 1, work: (0, _constant2.default)().not_replied }, { $set: { status: 0 } }).exec(function (err, update_status) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve("Nothing in Pending");
                    }
                });
            }
        });
    });
};

var sendToSelected = function sendToSelected(cron_service, logs, email) {
    return new Promise(function (resolve, reject) {
        cron_service.findOne({ status: 1, work: (0, _constant2.default)().selectedCandidate }).then(function (cronWorkData) {
            if (cronWorkData != null ? cronWorkData.get('candidate_list').length : false) {
                _db2.default.Smtp.findOne({ where: { status: 1 } }).then(function (smtp) {
                    var email = cronWorkData.get('candidate_list')[0];
                    _mail2.default.sendMail(email, cronWorkData.get('subject'), (0, _constant2.default)().smtp.text, smtp, cronWorkData.get('body')).then(function (mail_response) {
                        _emaillogs2.default.emailLog(logs, mail_response).then(function (log_response) {
                            cron_service.findOneAndUpdate({ _id: cronWorkData._id }, { "$pull": { candidate_list: email } }).then(function (updated_cronWork) {
                                resolve("SUCCESS");
                            });
                        });
                    });
                });
            } else {
                if (!cronWorkData) {
                    resolve("Nothing In Pending");
                } else {
                    cron_service.findOneAndUpdate({ _id: cronWorkData.get('_id') }, { status: 0 }).then(function (updated_cronWork) {
                        resolve("Nothing In Pending");
                    });
                }
            }
        });
    });
};

var sendToAll = function sendToAll(cron_service, logs, email) {
    return new Promise(function (resolve, reject) {
        cron_service.findOne({ status: 1, work: (0, _constant2.default)().sendToAll }).then(function (cronWorkData) {
            if (cronWorkData != null ? cronWorkData.get('candidate_list').length : false) {
                _db2.default.Smtp.findOne({ where: { status: 1 } }).then(function (smtp) {
                    var email_data = cronWorkData.get('candidate_list')[0];
                    console.log(email_data);
                    _mail2.default.sendMail(email_data, cronWorkData.get('subject'), (0, _constant2.default)().smtp.text, smtp, cronWorkData.get('body')).then(function (mail_response) {
                        _emaillogs2.default.emailLog(logs, mail_response).then(function (log_response) {
                            cron_service.findOneAndUpdate({ _id: cronWorkData._id }, { "$pull": { candidate_list: email_data } }).then(function (updated_cronWork) {
                                resolve("SUCCESS");
                            });
                        });
                    });
                });
            } else {
                if (!cronWorkData) {
                    resolve("Nothing In Pending");
                } else {
                    cron_service.findOneAndUpdate({ _id: cronWorkData.get('_id') }, { status: 0 }).then(function (updated_cronWork) {
                        resolve("Nothing In Pending");
                    });
                }
            }
        });
    });
};
exports.default = {
    reminderMail: reminderMail,
    sendEmailToPendingCandidate: sendEmailToPendingCandidate,
    sendEmailToNotRepliedCandidate: sendEmailToNotRepliedCandidate,
    sendToSelected: sendToSelected,
    sendToAll: sendToAll
};
//# sourceMappingURL=reminder.js.map