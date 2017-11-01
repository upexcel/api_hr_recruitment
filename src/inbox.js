import Imap from "imap";
import in_array from "in_array";
import GENERIC from "./modules/generic";
import _ from "lodash";
import db from "./db";
import config from "./config.js";
import mail from "./modules/mail";
import replace from "./modules/replaceVariable";
import automaticTag from "./modules/automaticTags";
import imapService from "./service/imap";
import moment from "moment";
import constant from './models/constant';
var MailParser = require("mailparser").simpleParser;
import forwardedEmail from "./modules/forwardedemail"


module.exports = {
    fetchEmail: function(email, logs, apiCall) {
        return new Promise((resolve, reject) => {
            db.Imap.findAll({
                where: {
                    "active": true
                }
            }).then(function(docs, err) {
                if (docs) {
                    _.forEach(docs, (val, key) => {
                        imapService.imapCredential(val)
                            .then((imap) => {
                                var headers = {};
                                imap.once("ready", function() {
                                    imapService.imapConnection(imap)
                                        .then((response) => {
                                            var delay = 24 * 3600 * 1000;
                                            var yesterday = new Date();
                                            yesterday.setTime(Date.now() - delay);
                                            yesterday = yesterday.toISOString();
                                            imap.search(["ALL", ["SINCE", yesterday]], function(err, results) {
                                                if (err) {
                                                    console.log(err)
                                                } else if (results) {
                                                    let UID_arr = [];
                                                    email.find({ imap_email: val.dataValues.email }).sort({
                                                        email_timestamp: -1
                                                    }).limit(1).exec(function(err, resp) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            if (resp.length == 0) {
                                                                UID_arr = results;
                                                            } else {
                                                                var row = resp[0];
                                                                var Last_UID = row.get("uid");
                                                                _.forEach(results, (val) => {
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
                                                                f.on("message", function(msg, seqno) {
                                                                    let flag = "";
                                                                    let uid = "";
                                                                    let unread
                                                                    let answered
                                                                    let attach;

                                                                    msg.once("attributes", function(attrs) {
                                                                        flag = attrs.flags;
                                                                        uid = attrs.uid;
                                                                        unread = !(in_array('\\Seen', flag));
                                                                        answered = in_array("\\Answered", flag);
                                                                        if (attrs.struct[0].type == "mixed") {
                                                                            attach = true;
                                                                        }
                                                                    });
                                                                    msg.on("body", function(stream) {
                                                                        var buffer = "";
                                                                        MailParser(stream).then(mail => {
                                                                            forwardedEmail.findEmail(mail)
                                                                                .then((email_data_to_store) => {
                                                                                    let { from, to, sender_mail, date, email_date, email_timestamp, subject } = email_data_to_store;
                                                                                    let body = mail.html || mail.text || mail.textAsHtml
                                                                                    automaticTag.tags(email, subject, date, from, sender_mail, val.dataValues.email, logs, to, true)
                                                                                        .then((tag) => {
                                                                                            if (tag.tagId.length || tag.default_tag_id) {
                                                                                                date = new Date(date).getTime()
                                                                                            }
                                                                                            email.findOne({
                                                                                                uid: uid,
                                                                                                imap_email: val.dataValues.email
                                                                                            }, function(err, data) {
                                                                                                --count;
                                                                                                if (err) {
                                                                                                    console.log(err)
                                                                                                }
                                                                                                if (!data) {
                                                                                                    let detail = new email({
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
                                                                                                        genuine_applicant: GENERIC.Genuine_Applicant(subject),
                                                                                                        send_template_count: tag.count || 0,
                                                                                                        template_id: tag.template_id || [],
                                                                                                        reply_to_id: tag.reply_to_id
                                                                                                    });
                                                                                                    detail.save(function(err) {
                                                                                                        if (err) {
                                                                                                            console.log("Duplicate Data");
                                                                                                        } else {
                                                                                                            console.log("data saved successfully");
                                                                                                            if (!count && apiCall && (key == docs.length - 1)) {
                                                                                                                resolve({ message: "All data fetched successfully" });
                                                                                                            } else if (key == docs.length - 1) {
                                                                                                                resolve({ message: "All data fetched successfully" })
                                                                                                            }
                                                                                                        }
                                                                                                    });
                                                                                                } else {
                                                                                                    console.log('Data already saved');
                                                                                                    if (!count && apiCall && (key == docs.length - 1)) {
                                                                                                        resolve({ message: "All data fetched successfully" });
                                                                                                    } else if (key == docs.length - 1) {
                                                                                                        resolve({ message: "All data fetched successfully" })
                                                                                                    }
                                                                                                }
                                                                                            })
                                                                                        })
                                                                                })
                                                                        }).catch(err => {
                                                                            console.log(err);
                                                                        });
                                                                        stream.on("data", function(chunk) {
                                                                            buffer += chunk.toString("utf8");
                                                                        });

                                                                        stream.once("end", function() {

                                                                        });
                                                                    });
                                                                });
                                                                f.once("error", function(err) {
                                                                    console.log("Fetch error: " + err);
                                                                });
                                                                f.once("end", function() {
                                                                    console.log("Done fetching all messages!");
                                                                    imap.end();
                                                                });
                                                            } else {
                                                                console.log("Nothing To fetch")
                                                                resolve({ message: "Nothing To fetch" })
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        })
                                        .catch((error) => {
                                            console.log(error)
                                        })
                                });
                                imap.once("error", function(err) {
                                    console.log(err);
                                });
                                imap.once("end", function() {
                                    console.log("Connection ended");
                                });
                                imap.connect();
                            });
                    });
                } else {
                    console.log(err);
                }
            })
        });
    },
    beforeDateEmail: function(email) {
        return new Promise((resolve, reject) => {
            db.Imap.findAll({
                where: {
                    "active": true
                }
            }).then(function(docs, err) {
                let count = 0;
                if (docs[0] != null) {
                    _.forEach(docs, (val, key) => {
                        imapService.imapCredential(val)
                            .then((imap) => {
                                var headers = {};
                                imap.once("ready", function() {
                                    imapService.imapConnection(imap)
                                        .then((response) => {
                                            let date = '';
                                            let dateFrom = '';
                                            var row = val.dataValues;
                                            if (row && row.last_fetched_time) {
                                                date = moment(new Date(row.last_fetched_time)).format("MMM DD, YYYY");
                                                let current_date = moment(new Date()).subtract(1, 'days').format("MMM DD, YYYY");
                                                if (new Date() <= new Date(date)) {
                                                    dateFrom = moment(new Date()).subtract(1, 'days').format('MMM DD, YYYY');
                                                } else {
                                                    dateFrom = moment(date).add(constant().old_emails_fetch_days_count, 'days').format('MMM DD, YYYY');
                                                }
                                            }
                                            imap.search(['ALL', ['SINCE', date],
                                                ['BEFORE', dateFrom]
                                            ], function(err, results) {
                                                if (err) {
                                                    console.log(err)
                                                } else if (results.length) {
                                                    if (new Date() <= new Date(dateFrom)) {
                                                        dateFrom = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
                                                    }
                                                    db.Imap.update({ last_fetched_time: dateFrom }, { where: { email: val.email } })
                                                        .then((last_updated_time) => { console.log("last time updated") })
                                                    count = results.length
                                                    var f = imap.fetch(results, {
                                                        bodies: "",
                                                        struct: true
                                                    });
                                                    f.on("message", function(msg, seqno) {
                                                        let flag = "";
                                                        let uid = "";
                                                        let unread
                                                        let answered
                                                        let attach;

                                                        msg.once("attributes", function(attrs) {
                                                            flag = attrs.flags;
                                                            uid = attrs.uid;
                                                            unread = !(in_array('\\Seen', flag));
                                                            answered = in_array("\\Answered", flag);
                                                            if (attrs.struct[0].type == "mixed") {
                                                                attach = true;
                                                            }
                                                        });

                                                        msg.on("body", function(stream) {
                                                            var buffer = "";
                                                            MailParser(stream).then(mail => {
                                                                forwardedEmail.findEmail(mail)
                                                                    .then((email_data_to_store) => {
                                                                        let { from, to, sender_mail, date, email_date, email_timestamp, subject } = email_data_to_store;
                                                                        let body = mail.html || mail.text || mail.textAsHtml
                                                                        automaticTag.tags(email, subject, date, from, sender_mail, val.dataValues.email, to, false, false)
                                                                            .then((tag) => {
                                                                                if (tag.tagId.length || tag.default_tag_id) {
                                                                                    date = new Date(date).getTime()
                                                                                }
                                                                                email.findOne({
                                                                                    uid: uid,
                                                                                    imap_email: val.dataValues.email
                                                                                }, function(err, data) {
                                                                                    --count;
                                                                                    if (err) {
                                                                                        console.log(err)
                                                                                    }
                                                                                    if (!data) {
                                                                                        let detail = new email({
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
                                                                                            genuine_applicant: GENERIC.Genuine_Applicant(subject),
                                                                                            send_template_count: tag.count || 0,
                                                                                            template_id: tag.template_id || []
                                                                                        });
                                                                                        detail.save(function(err) {
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
                                                                                })
                                                                            })
                                                                    })
                                                            }).catch(err => {
                                                                console.log(err);
                                                            });
                                                            stream.on("data", function(chunk) {
                                                                buffer += chunk.toString("utf8");
                                                            });

                                                            stream.once("end", function() {

                                                            });
                                                        });
                                                    });
                                                    f.once("error", function(err) {
                                                        console.log("Fetch error: " + err);
                                                    });
                                                    f.once("end", function() {
                                                        console.log("Done fetching all messages!");
                                                        imap.end();
                                                    });
                                                } else {
                                                    email.find({ imap_email: val.dataValues.email }).count().exec(function(err, count) {
                                                        if (count >= response.messages.total) {
                                                            console.log('Nothing to Fetch');
                                                        } else {
                                                            db.Imap.update({ last_fetched_time: dateFrom }, { where: { email: val.email } })
                                                                .then((last_updated_time) => { console.log("last time updated") })
                                                        }
                                                    })
                                                }
                                            });
                                        })
                                        .then((error) => {
                                            console.log(error)
                                        })
                                });
                                imap.once("error", function(err) {
                                    console
                                        .log(err);
                                });
                                imap.once("end", function() {
                                    console.log("Connection ended");
                                });
                                imap.connect();
                            });
                        if (!count && (key == docs.length - 1)) {
                            let imap_emails = [];
                            _.forEach(docs, (email, key) => {
                                imap_emails.push(email.email)
                            })
                        }
                    });
                } else {
                    console.log("No Active connection")
                }
            });
        });
    },

    skippedDates: function(email, logs) {
        return new Promise((resolve, reject) => {
            let count;
            db.Imap.findAll({
                where: {
                    "active": true
                }
            }).then(function(docs, err) {
                if (docs[0] != null) {
                    _.forEach(docs, (val, key) => {
                        imapService.imapCredential(val)
                            .then((imap) => {
                                let headers = {};
                                imap.once("ready", function() {
                                    imapService.imapConnection(imap)
                                        .then((response) => {
                                            let date = '';
                                            let dateFrom = '';
                                            let row = val.dataValues;
                                            let left_days;
                                            if (row.days_left_to_fetched) {
                                                if (!row.fetched_date_till) {
                                                    row.fetched_date_till = new Date();
                                                }
                                                date = moment(new Date(row.fetched_date_till)).format("MMM DD, YYYY");
                                                dateFrom = moment(date).subtract(constant().old_emails_fetch_days_count, 'days').format('MMM DD, YYYY');
                                                left_days = row.days_left_to_fetched - constant().old_emails_fetch_days_count;
                                                imap.search(['ALL', ['SINCE', dateFrom],
                                                    ['BEFORE', date]
                                                ], function(err, results) {
                                                    if (err) {
                                                        console.log(err)
                                                    } else if (results.length) {
                                                        db.Imap.update({ fetched_date_till: dateFrom, days_left_to_fetched: left_days }, { where: { email: val.email } })
                                                            .then((last_updated_time) => { console.log("last time updated") })
                                                        count = results.length
                                                        let f = imap.fetch(results, {
                                                            bodies: "",
                                                            struct: true
                                                        });
                                                        f.on("message", function(msg, seqno) {
                                                            let flag = "";
                                                            let uid = "";
                                                            let unread
                                                            let answered
                                                            let attach;

                                                            msg.once("attributes", function(attrs) {
                                                                flag = attrs.flags;
                                                                uid = attrs.uid;
                                                                unread = !(in_array('\\Seen', flag));
                                                                answered = in_array("\\Answered", flag);
                                                                if (attrs.struct[0].type == "mixed") {
                                                                    attach = true;
                                                                }
                                                            });


                                                            msg.on("body", function(stream) {
                                                                var buffer = "";
                                                                MailParser(stream).then(mail => {
                                                                    forwardedEmail.findEmail(mail)
                                                                        .then((email_data_to_store) => {
                                                                            let { from, to, sender_mail, date, email_date, email_timestamp, subject } = email_data_to_store;
                                                                            let body = mail.html || mail.text || mail.textAsHtml
                                                                            automaticTag.tags(email, subject, date, from, sender_mail, val.dataValues.email, logs, to, true)
                                                                                .then((tag) => {
                                                                                    if (tag.tagId.length || tag.default_tag_id) {
                                                                                        date = new Date(date).getTime()
                                                                                    }
                                                                                    email.findOne({
                                                                                        uid: uid,
                                                                                        imap_email: val.dataValues.email
                                                                                    }, function(err, data) {
                                                                                        --count;
                                                                                        if (err) {
                                                                                            console.log(err)
                                                                                        }
                                                                                        if (!data) {
                                                                                            let detail = new email({
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
                                                                                                genuine_applicant: GENERIC.Genuine_Applicant(subject),
                                                                                                send_template_count: tag.count || 0,
                                                                                                template_id: tag.template_id || []
                                                                                            });
                                                                                            detail.save(function(err) {
                                                                                                if (err) {
                                                                                                    console.log("Duplicate Data");
                                                                                                } else {
                                                                                                    console.log("data saved successfully");
                                                                                                    resolve()
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            if (count) {
                                                                                                console.log("Data already saved");
                                                                                            } else {
                                                                                                resolve()
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                })
                                                                        })
                                                                }).catch(err => {
                                                                    console.log(err);
                                                                });
                                                                stream.on("data", function(chunk) {
                                                                    buffer += chunk.toString("utf8");
                                                                });

                                                                stream.once("end", function() {

                                                                });
                                                            });
                                                        });
                                                        f.once("error", function(err) {
                                                            console.log("Fetch error: " + err);
                                                        });
                                                        f.once("end", function() {
                                                            console.log("Done fetching all messages!");
                                                            imap.end();
                                                        });
                                                    } else {
                                                        email.find({ imap_email: val.dataValues.email }).count().exec(function(err, count) {
                                                            if (count >= response.messages.total) {
                                                                console.log('Nothing to Fetch');
                                                                resolve()
                                                            } else {

                                                                db.Imap.update({ fetched_date_till: dateFrom, days_left_to_fetched: left_days }, { where: { email: val.email } })
                                                                    .then((last_updated_time) => {
                                                                        console.log("last time updated")
                                                                        resolve()
                                                                    })
                                                            }
                                                        })
                                                    }
                                                });
                                            } else {
                                                resolve("nothing in pending")
                                            }

                                        })
                                        .then((error) => {
                                            console.log(error)
                                        })
                                });
                                imap.once("error", function(err) {
                                    console.log(err);
                                });
                                imap.once("end", function() {
                                    console.log("Connection ended");
                                });
                                imap.connect();
                            });
                        if (!count && (key == docs.length - 1)) {
                            let imap_emails = [];
                            _.forEach(docs, (email, key) => {
                                imap_emails.push(email.email)
                            })
                        }
                    });
                } else {
                    console.log("No Active connection")
                    resolve()
                }
            });
        })
    }
};