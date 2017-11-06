"use strict";

var _imap = require("imap");

var _imap2 = _interopRequireDefault(_imap);

var _in_array = require("in_array");

var _in_array2 = _interopRequireDefault(_in_array);

var _generic = require("./modules/generic");

var _generic2 = _interopRequireDefault(_generic);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _db = require("./db");

var _db2 = _interopRequireDefault(_db);

var _config = require("./config.js");

var _config2 = _interopRequireDefault(_config);

var _mail = require("./modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _replaceVariable = require("./modules/replaceVariable");

var _replaceVariable2 = _interopRequireDefault(_replaceVariable);

var _automaticTags = require("./modules/automaticTags");

var _automaticTags2 = _interopRequireDefault(_automaticTags);

var _imap3 = require("./service/imap");

var _imap4 = _interopRequireDefault(_imap3);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _constant = require("./models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _forwardedemail = require("./modules/forwardedemail");

var _forwardedemail2 = _interopRequireDefault(_forwardedemail);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MailParser = require("mailparser").simpleParser;


module.exports = {
    fetchEmail: function fetchEmail(email, logs, apiCall) {
        return new Promise(function (resolve, reject) {
            _db2.default.Imap.findAll({
                where: {
                    "active": true
                }
            }).then(function (docs, err) {
                if (docs) {
                    _lodash2.default.forEach(docs, function (val, key) {
                        _imap4.default.imapCredential(val).then(function (imap) {
                            var headers = {};
                            imap.once("ready", function () {
                                _imap4.default.imapConnection(imap).then(function (response) {
                                    var delay = 24 * 3600 * 1000;
                                    var yesterday = new Date();
                                    yesterday.setTime(Date.now() - delay);
                                    yesterday = yesterday.toISOString();
                                    imap.search(["ALL", ["SINCE", yesterday]], function (err, results) {
                                        if (err) {
                                            console.log(err);
                                        } else if (results) {
                                            var UID_arr = [];
                                            email.find({ imap_email: val.dataValues.email }).sort({
                                                email_timestamp: -1
                                            }).limit(1).exec(function (err, resp) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    if (resp.length == 0) {
                                                        UID_arr = results;
                                                    } else {
                                                        var row = resp[0];
                                                        var Last_UID = row.get("uid");
                                                        _lodash2.default.forEach(results, function (val) {
                                                            if (val > Last_UID) {
                                                                UID_arr.push(val);
                                                            }
                                                        });
                                                    }
                                                    var count = UID_arr.length;
                                                    if (UID_arr[0] != null) {
                                                        var f = imap.fetch(UID_arr, {
                                                            bodies: "",
                                                            struct: true
                                                        });
                                                        f.on("message", function (msg, seqno) {
                                                            var flag = "";
                                                            var uid = "";
                                                            var unread = void 0;
                                                            var answered = void 0;
                                                            var attach = void 0;

                                                            msg.once("attributes", function (attrs) {
                                                                flag = attrs.flags;
                                                                uid = attrs.uid;
                                                                unread = !(0, _in_array2.default)('\\Seen', flag);
                                                                answered = (0, _in_array2.default)("\\Answered", flag);
                                                                if (attrs.struct[0].type == "mixed") {
                                                                    attach = true;
                                                                }
                                                            });
                                                            msg.on("body", function (stream) {
                                                                var buffer = "";
                                                                MailParser(stream).then(function (mail) {
                                                                    _forwardedemail2.default.findEmail(mail).then(function (email_data_to_store) {
                                                                        var from = email_data_to_store.from,
                                                                            to = email_data_to_store.to,
                                                                            sender_mail = email_data_to_store.sender_mail,
                                                                            date = email_data_to_store.date,
                                                                            email_date = email_data_to_store.email_date,
                                                                            email_timestamp = email_data_to_store.email_timestamp,
                                                                            subject = email_data_to_store.subject;

                                                                        var body = mail.html || mail.text || mail.textAsHtml;
                                                                        _automaticTags2.default.tags(email, subject, date, from, sender_mail, val.dataValues.email, logs, to, true).then(function (tag) {
                                                                            if (tag.tagId.length || tag.default_tag_id) {
                                                                                date = new Date(date).getTime();
                                                                            }
                                                                            email.findOne({
                                                                                uid: uid,
                                                                                imap_email: val.dataValues.email
                                                                            }, function (err, data) {
                                                                                --count;
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                }
                                                                                if (!data) {
                                                                                    var detail = new email({
                                                                                        email_id: seqno,
                                                                                        from: from,
                                                                                        to: to,
                                                                                        sender_mail: sender_mail,
                                                                                        date: date,
                                                                                        email_date: email_date,
                                                                                        email_timestamp: email_timestamp,
                                                                                        subject: subject,
                                                                                        unread: true,
                                                                                        answered: answered,
                                                                                        uid: uid,
                                                                                        body: body,
                                                                                        tag_id: tag.tagId,
                                                                                        is_automatic_email_send: tag.is_automatic_email_send || 0,
                                                                                        default_tag: tag.default_tag_id || "",
                                                                                        is_attachment: attach || false,
                                                                                        imap_email: val.dataValues.email,
                                                                                        genuine_applicant: _generic2.default.Genuine_Applicant(subject),
                                                                                        send_template_count: tag.count || 0,
                                                                                        template_id: tag.template_id || [],
                                                                                        reply_to_id: tag.reply_to_id
                                                                                    });
                                                                                    detail.save(function (err) {
                                                                                        if (err) {
                                                                                            console.log("Duplicate Data");
                                                                                        } else {
                                                                                            console.log("data saved successfully");
                                                                                            if (!count && apiCall && key == docs.length - 1) {
                                                                                                resolve({ message: "All data fetched successfully" });
                                                                                            } else if (key == docs.length - 1) {
                                                                                                resolve({ message: "All data fetched successfully" });
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                } else {
                                                                                    console.log('Data already saved');
                                                                                    if (!count && apiCall && key == docs.length - 1) {
                                                                                        resolve({ message: "All data fetched successfully" });
                                                                                    } else if (key == docs.length - 1) {
                                                                                        resolve({ message: "All data fetched successfully" });
                                                                                    }
                                                                                }
                                                                            });
                                                                        });
                                                                    });
                                                                }).catch(function (err) {
                                                                    console.log(err);
                                                                });
                                                                stream.on("data", function (chunk) {
                                                                    buffer += chunk.toString("utf8");
                                                                });

                                                                stream.once("end", function () {});
                                                            });
                                                        });
                                                        f.once("error", function (err) {
                                                            console.log("Fetch error: " + err);
                                                        });
                                                        f.once("end", function () {
                                                            console.log("Done fetching all messages!");
                                                            imap.end();
                                                        });
                                                    } else {
                                                        console.log("Nothing To fetch");
                                                        resolve({ message: "Nothing To fetch" });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }).catch(function (error) {
                                    console.log(error);
                                });
                            });
                            imap.once("error", function (err) {
                                console.log(err);
                            });
                            imap.once("end", function () {
                                console.log("Connection ended");
                            });
                            imap.connect();
                        });
                    });
                } else {
                    console.log(err);
                }
            });
        });
    },
    beforeDateEmail: function beforeDateEmail(email) {
        return new Promise(function (resolve, reject) {
            _db2.default.Imap.findAll({
                where: {
                    "active": true
                }
            }).then(function (docs, err) {
                var count = 0;
                if (docs[0] != null) {
                    _lodash2.default.forEach(docs, function (val, key) {
                        _imap4.default.imapCredential(val).then(function (imap) {
                            var headers = {};
                            imap.once("ready", function () {
                                _imap4.default.imapConnection(imap).then(function (response) {
                                    var date = '';
                                    var dateFrom = '';
                                    var row = val.dataValues;
                                    if (row && row.last_fetched_time) {
                                        date = (0, _moment2.default)(new Date(row.last_fetched_time)).format("MMM DD, YYYY");
                                        var current_date = (0, _moment2.default)(new Date()).subtract(1, 'days').format("MMM DD, YYYY");
                                        if (new Date() <= new Date(date)) {
                                            dateFrom = (0, _moment2.default)(new Date()).subtract(1, 'days').format('MMM DD, YYYY');
                                        } else {
                                            dateFrom = (0, _moment2.default)(date).add((0, _constant2.default)().old_emails_fetch_days_count, 'days').format('MMM DD, YYYY');
                                        }
                                    }
                                    imap.search(['ALL', ['SINCE', date], ['BEFORE', dateFrom]], function (err, results) {
                                        if (err) {
                                            console.log(err);
                                        } else if (results.length) {
                                            if (new Date() <= new Date(dateFrom)) {
                                                dateFrom = (0, _moment2.default)(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
                                            }
                                            _db2.default.Imap.update({ last_fetched_time: dateFrom }, { where: { email: val.email } }).then(function (last_updated_time) {
                                                console.log("last time updated");
                                            });
                                            count = results.length;
                                            var f = imap.fetch(results, {
                                                bodies: "",
                                                struct: true
                                            });
                                            f.on("message", function (msg, seqno) {
                                                var flag = "";
                                                var uid = "";
                                                var unread = void 0;
                                                var answered = void 0;
                                                var attach = void 0;

                                                msg.once("attributes", function (attrs) {
                                                    flag = attrs.flags;
                                                    uid = attrs.uid;
                                                    unread = !(0, _in_array2.default)('\\Seen', flag);
                                                    answered = (0, _in_array2.default)("\\Answered", flag);
                                                    if (attrs.struct[0].type == "mixed") {
                                                        attach = true;
                                                    }
                                                });

                                                msg.on("body", function (stream) {
                                                    var buffer = "";
                                                    MailParser(stream).then(function (mail) {
                                                        _forwardedemail2.default.findEmail(mail).then(function (email_data_to_store) {
                                                            var from = email_data_to_store.from,
                                                                to = email_data_to_store.to,
                                                                sender_mail = email_data_to_store.sender_mail,
                                                                date = email_data_to_store.date,
                                                                email_date = email_data_to_store.email_date,
                                                                email_timestamp = email_data_to_store.email_timestamp,
                                                                subject = email_data_to_store.subject;

                                                            var body = mail.html || mail.text || mail.textAsHtml;
                                                            _automaticTags2.default.tags(email, subject, date, from, sender_mail, val.dataValues.email, to, false, false).then(function (tag) {
                                                                if (tag.tagId.length || tag.default_tag_id) {
                                                                    date = new Date(date).getTime();
                                                                }
                                                                email.findOne({
                                                                    uid: uid,
                                                                    imap_email: val.dataValues.email
                                                                }, function (err, data) {
                                                                    --count;
                                                                    if (err) {
                                                                        console.log(err);
                                                                    }
                                                                    if (!data) {
                                                                        var detail = new email({
                                                                            email_id: seqno,
                                                                            from: from,
                                                                            to: to,
                                                                            sender_mail: sender_mail,
                                                                            date: date,
                                                                            email_date: email_date,
                                                                            email_timestamp: email_timestamp,
                                                                            subject: subject,
                                                                            unread: true,
                                                                            answered: answered,
                                                                            uid: uid,
                                                                            body: body,
                                                                            tag_id: tag.tagId,
                                                                            is_automatic_email_send: tag.is_automatic_email_send || 0,
                                                                            default_tag: tag.default_tag_id || "",
                                                                            is_attachment: attach || false,
                                                                            imap_email: val.dataValues.email,
                                                                            genuine_applicant: _generic2.default.Genuine_Applicant(subject),
                                                                            send_template_count: tag.count || 0,
                                                                            template_id: tag.template_id || []
                                                                        });
                                                                        detail.save(function (err) {
                                                                            if (err) {
                                                                                console.log("Duplicate Data");
                                                                            } else {
                                                                                console.log("data saved successfully");
                                                                            }
                                                                        });
                                                                    } else {
                                                                        if (count) {
                                                                            console.log("Data already saved");
                                                                        }
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                    });
                                                    stream.on("data", function (chunk) {
                                                        buffer += chunk.toString("utf8");
                                                    });

                                                    stream.once("end", function () {});
                                                });
                                            });
                                            f.once("error", function (err) {
                                                console.log("Fetch error: " + err);
                                            });
                                            f.once("end", function () {
                                                console.log("Done fetching all messages!");
                                                imap.end();
                                            });
                                        } else {
                                            email.find({ imap_email: val.dataValues.email }).count().exec(function (err, count) {
                                                if (count >= response.messages.total) {
                                                    console.log('Nothing to Fetch');
                                                } else {
                                                    _db2.default.Imap.update({ last_fetched_time: dateFrom }, { where: { email: val.email } }).then(function (last_updated_time) {
                                                        console.log("last time updated");
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }).then(function (error) {
                                    console.log(error);
                                });
                            });
                            imap.once("error", function (err) {
                                console.log(err);
                            });
                            imap.once("end", function () {
                                console.log("Connection ended");
                            });
                            imap.connect();
                        });
                        if (!count && key == docs.length - 1) {
                            var imap_emails = [];
                            _lodash2.default.forEach(docs, function (email, key) {
                                imap_emails.push(email.email);
                            });
                        }
                    });
                } else {
                    console.log("No Active connection");
                }
            });
        });
    },

    skippedDates: function skippedDates(email, logs) {
        return new Promise(function (resolve, reject) {
            var count = void 0;
            _db2.default.Imap.findAll({
                where: {
                    "active": true
                }
            }).then(function (docs, err) {
                if (docs[0] != null) {
                    _lodash2.default.forEach(docs, function (val, key) {
                        _imap4.default.imapCredential(val).then(function (imap) {
                            var headers = {};
                            imap.once("ready", function () {
                                _imap4.default.imapConnection(imap).then(function (response) {
                                    var date = '';
                                    var dateFrom = '';
                                    var row = val.dataValues;
                                    var left_days = void 0;
                                    if (row.days_left_to_fetched) {
                                        if (!row.fetched_date_till) {
                                            row.fetched_date_till = new Date();
                                        }
                                        date = (0, _moment2.default)(new Date(row.fetched_date_till)).format("MMM DD, YYYY");
                                        dateFrom = (0, _moment2.default)(date).subtract((0, _constant2.default)().old_emails_fetch_days_count, 'days').format('MMM DD, YYYY');
                                        left_days = row.days_left_to_fetched - (0, _constant2.default)().old_emails_fetch_days_count;
                                        imap.search(['ALL', ['SINCE', dateFrom], ['BEFORE', date]], function (err, results) {
                                            if (err) {
                                                console.log(err);
                                            } else if (results.length) {
                                                _db2.default.Imap.update({ fetched_date_till: dateFrom, days_left_to_fetched: left_days }, { where: { email: val.email } }).then(function (last_updated_time) {
                                                    console.log("last time updated");
                                                });
                                                count = results.length;
                                                var f = imap.fetch(results, {
                                                    bodies: "",
                                                    struct: true
                                                });
                                                f.on("message", function (msg, seqno) {
                                                    var flag = "";
                                                    var uid = "";
                                                    var unread = void 0;
                                                    var answered = void 0;
                                                    var attach = void 0;

                                                    msg.once("attributes", function (attrs) {
                                                        flag = attrs.flags;
                                                        uid = attrs.uid;
                                                        unread = !(0, _in_array2.default)('\\Seen', flag);
                                                        answered = (0, _in_array2.default)("\\Answered", flag);
                                                        if (attrs.struct[0].type == "mixed") {
                                                            attach = true;
                                                        }
                                                    });

                                                    msg.on("body", function (stream) {
                                                        var buffer = "";
                                                        MailParser(stream).then(function (mail) {
                                                            _forwardedemail2.default.findEmail(mail).then(function (email_data_to_store) {
                                                                var from = email_data_to_store.from,
                                                                    to = email_data_to_store.to,
                                                                    sender_mail = email_data_to_store.sender_mail,
                                                                    date = email_data_to_store.date,
                                                                    email_date = email_data_to_store.email_date,
                                                                    email_timestamp = email_data_to_store.email_timestamp,
                                                                    subject = email_data_to_store.subject;

                                                                var body = mail.html || mail.text || mail.textAsHtml;
                                                                _automaticTags2.default.tags(email, subject, date, from, sender_mail, val.dataValues.email, logs, to, true).then(function (tag) {
                                                                    if (tag.tagId.length || tag.default_tag_id) {
                                                                        date = new Date(date).getTime();
                                                                    }
                                                                    email.findOne({
                                                                        uid: uid,
                                                                        imap_email: val.dataValues.email
                                                                    }, function (err, data) {
                                                                        --count;
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                        if (!data) {
                                                                            var detail = new email({
                                                                                email_id: seqno,
                                                                                from: from,
                                                                                to: to,
                                                                                sender_mail: sender_mail,
                                                                                date: date,
                                                                                email_date: email_date,
                                                                                email_timestamp: email_timestamp,
                                                                                subject: subject,
                                                                                unread: true,
                                                                                answered: answered,
                                                                                uid: uid,
                                                                                body: body,
                                                                                tag_id: tag.tagId,
                                                                                is_automatic_email_send: tag.is_automatic_email_send || 0,
                                                                                default_tag: tag.default_tag_id || "",
                                                                                is_attachment: attach || false,
                                                                                imap_email: val.dataValues.email,
                                                                                genuine_applicant: _generic2.default.Genuine_Applicant(subject),
                                                                                send_template_count: tag.count || 0,
                                                                                template_id: tag.template_id || []
                                                                            });
                                                                            detail.save(function (err) {
                                                                                if (err) {
                                                                                    console.log("Duplicate Data");
                                                                                } else {
                                                                                    console.log("data saved successfully");
                                                                                    resolve();
                                                                                }
                                                                            });
                                                                        } else {
                                                                            if (count) {
                                                                                console.log("Data already saved");
                                                                            } else {
                                                                                resolve();
                                                                            }
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                        });
                                                        stream.on("data", function (chunk) {
                                                            buffer += chunk.toString("utf8");
                                                        });

                                                        stream.once("end", function () {});
                                                    });
                                                });
                                                f.once("error", function (err) {
                                                    console.log("Fetch error: " + err);
                                                });
                                                f.once("end", function () {
                                                    console.log("Done fetching all messages!");
                                                    imap.end();
                                                });
                                            } else {
                                                email.find({ imap_email: val.dataValues.email }).count().exec(function (err, count) {
                                                    if (count >= response.messages.total) {
                                                        console.log('Nothing to Fetch');
                                                        resolve();
                                                    } else {

                                                        _db2.default.Imap.update({ fetched_date_till: dateFrom, days_left_to_fetched: left_days }, { where: { email: val.email } }).then(function (last_updated_time) {
                                                            console.log("last time updated");
                                                            resolve();
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        resolve("nothing in pending");
                                    }
                                }).then(function (error) {
                                    console.log(error);
                                });
                            });
                            imap.once("error", function (err) {
                                console.log(err);
                            });
                            imap.once("end", function () {
                                console.log("Connection ended");
                            });
                            imap.connect();
                        });
                        if (!count && key == docs.length - 1) {
                            var imap_emails = [];
                            _lodash2.default.forEach(docs, function (email, key) {
                                imap_emails.push(email.email);
                            });
                        }
                    });
                } else {
                    console.log("No Active connection");
                    resolve();
                }
            });
        });
    }
};
//# sourceMappingURL=inbox.js.map