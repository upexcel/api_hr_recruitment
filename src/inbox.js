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
var MailParser = require("mailparser").MailParser;


module.exports = {
    fetchEmail: function(email, apiCall) {
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
                                                        _id: -1
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
                                                                    if (val >= Last_UID) {
                                                                        UID_arr.push(val);
                                                                    }
                                                                });
                                                            }
                                                            var count = UID_arr.length;
                                                            if (UID_arr[0] != null) {
                                                                var f = imap.fetch(UID_arr, {
                                                                    bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                                                                    struct: true
                                                                });
                                                                f.on("message", function(msg, seqno) {
                                                                    var flag = "";
                                                                    var uid = "";
                                                                    var bodyMsg = "";
                                                                    var prefix = "(#" + seqno + ") ";
                                                                    var parser = new MailParser();
                                                                    var body;
                                                                    var attach;
                                                                    parser.on("data", data => {
                                                                        if (data.text) {
                                                                            var html = data.text.substr((data.text.indexOf("<html>") - 7) || (data.text.indexOf("<!DOCTYPE html>" - 16))).substr(7, data.text.substr(data.text.indexOf("<html>") - 7).indexOf('</html>'))
                                                                            var div = data.text.substr(data.text.indexOf("<div") - 5).substr(5, data.text.substr(data.text.indexOf("<div") - 6).indexOf('</div>'));
                                                                        }
                                                                        body = html || div || data.html || data.text;
                                                                    });
                                                                    msg.on("body", function(stream) {
                                                                        var buffer = "";
                                                                        stream.on("data", function(chunk) {
                                                                            parser.write(chunk.toString("utf8"));
                                                                            buffer += chunk.toString("utf8");
                                                                        });

                                                                        stream.once("end", function() {
                                                                            headers = Imap.parseHeader(buffer);
                                                                        });
                                                                    });
                                                                    msg.once("attributes", function(attrs) {
                                                                        flag = attrs.flags;
                                                                        uid = attrs.uid;
                                                                        if (attrs.struct[0].type == "mixed") {
                                                                            attach = true;
                                                                        }
                                                                    });
                                                                    msg.once("end", function() {
                                                                        parser.end()
                                                                        let hash1, from, to, hash, sender_mail, date, email_date, email_timestamp, subject;

                                                                        if (headers.from) {
                                                                            hash1 = headers.from.toString().substring(headers.from.toString().indexOf("\""));
                                                                            from = hash1.substring(0, hash1.lastIndexOf("<"));
                                                                            hash = headers.from.toString().substring(headers.from.toString().indexOf("<") + 1);
                                                                            sender_mail = hash.substring(0, hash.lastIndexOf(">"));
                                                                        }
                                                                        if (headers.date) {
                                                                            date = headers.date.toString();
                                                                            email_date = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1) + "-" + new Date(date).getDate();
                                                                            email_timestamp = new Date(date).getTime();
                                                                        }
                                                                        if (headers.subject) {
                                                                            subject = headers.subject.toString();
                                                                        }
                                                                        if (headers.to) {
                                                                            to = headers.to;
                                                                        }
                                                                        let unread = !(in_array('\\Seen', flag)),
                                                                            answered = in_array("\\Answered", flag);

                                                                        parser.once("end", function() {
                                                                            automaticTag.tags(email, subject, date, from, sender_mail, val.dataValues.email, true)
                                                                                .then((tag) => {
                                                                                    if (tag.tagId.length || tag.default_tag_id) {
                                                                                        email_timestamp = new Date().getTime()
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
                                                                                                genuine_applicant: GENERIC.Genuine_Applicant(subject)
                                                                                            });
                                                                                            detail.save(function(err) {
                                                                                                if (err) {
                                                                                                    console.log("Duplicate Data");
                                                                                                } else {
                                                                                                    console.log(tag)
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
                                                                                    });
                                                                                });
                                                                        })
                                                                    })
                                                                    console.log(prefix + "Finished");
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
        db.Imap.findAll({
            where: {
                "active": true
            }
        }).then(function(docs, err) {
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
                                            dateFrom = moment(date).subtract(constant().limit_for_email_fetch, 'days').format('MMM DD, YYYY');
                                        } else {
                                            date = moment(new Date()).subtract(1, 'days').format("MMM DD, YYYY");
                                            dateFrom = moment(date).subtract(constant().limit_for_email_fetch, 'days').format('MMM DD, YYYY');
                                        }
                                        console.log(date, dateFrom)
                                        imap.search(['ALL', ['SINCE', dateFrom],
                                            ['BEFORE', date]
                                        ], function(err, results) {
                                            if (err) {
                                                console.log(err)
                                            } else if (results.length) {
                                                let count = results.length
                                                var f = imap.fetch(results, {
                                                    bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                                                    struct: true
                                                });
                                                f.on("message", function(msg, seqno) {
                                                    var flag = "";
                                                    var uid = "";
                                                    var bodyMsg = "";
                                                    var prefix = "(#" + seqno + ") ";
                                                    var parser = new MailParser();
                                                    var body;
                                                    var attach;
                                                    parser.on("data", data => {
                                                        if (data.text) {
                                                            var html = data.text.substr(data.text.indexOf("<html>") - 7).substr(7, data.text.substr(data.text.indexOf("<html>") - 7).indexOf('</html>'))
                                                            var div = data.text.substr(data.text.indexOf("<div") - 5).substr(5, data.text.substr(data.text.indexOf("<div") - 6).indexOf('</div>'));
                                                        }
                                                        body = html || div || data.html || data.text;
                                                    });
                                                    msg.on("body", function(stream) {

                                                        var buffer = "";
                                                        stream.on("data", function(chunk) {
                                                            parser.write(chunk.toString("utf8"));
                                                            buffer += chunk.toString("utf8");
                                                        });

                                                        stream.once("end", function() {
                                                            headers = Imap.parseHeader(buffer);
                                                        });
                                                    });
                                                    msg.once("attributes", function(attrs) {
                                                        flag = attrs.flags;
                                                        uid = attrs.uid;
                                                        if (attrs.struct[0].type == "mixed") {
                                                            attach = true;
                                                        }
                                                    });
                                                    msg.once("end", function() {
                                                        parser.end()
                                                        var hash1;
                                                        var from;
                                                        var to;
                                                        var hash;
                                                        var sender_mail;
                                                        var date;
                                                        var email_date;
                                                        var email_timestamp;
                                                        var subject;
                                                        var attach;
                                                        if (headers.from) {
                                                            hash1 = headers.from.toString().substring(headers.from.toString().indexOf("\""));
                                                            from = hash1.substring(0, hash1.lastIndexOf("<"));
                                                            to = headers.to;
                                                            hash = headers.from.toString().substring(headers.from.toString().indexOf("<") + 1);
                                                            sender_mail = hash.substring(0, hash.lastIndexOf(">"));

                                                        }
                                                        if (headers.date) {
                                                            date = headers.date.toString();
                                                            email_date = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1) + "-" + new Date(date).getDate();
                                                            email_timestamp = new Date(date).getTime();
                                                        }
                                                        if (headers.subject) {
                                                            subject = headers.subject.toString();
                                                        }
                                                        var unread = !(in_array('\\Seen', flag)),
                                                            answered = in_array("\\Answered", flag);
                                                        parser.once("end", function() {
                                                            automaticTag.tags(email, subject, date, from, sender_mail, val.dataValues.email, false)
                                                                .then((tag) => {
                                                                    count--;
                                                                    if (tag.tagId.length || tag.default_tag_id) {
                                                                        email_timestamp = new Date().getTime()
                                                                    }
                                                                    email.findOne({
                                                                        uid: uid,
                                                                        imap_email: val.dataValues.email
                                                                    }, function(err, data) {
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
                                                                                is_automatic_email_send: tag.is_automatic_email_send || 0,
                                                                                tag_id: tag.tagId || [],
                                                                                default_tag: tag.default_tag_id || "",
                                                                                is_attachment: attach || false,
                                                                                imap_email: val.dataValues.email,
                                                                                genuine_applicant: GENERIC.Genuine_Applicant(subject)
                                                                            });
                                                                            detail.save(function(err) {
                                                                                if (err) {
                                                                                    console.log("Duplicate Data");
                                                                                } else {
                                                                                    console.log(tag)
                                                                                    console.log("data saved successfully");
                                                                                    if (!count && (key == docs.length - 1)) {
                                                                                        let imap_emails = [];
                                                                                        _.forEach(docs, (email, key) => {
                                                                                            imap_emails.push(email.email)
                                                                                        })
                                                                                        db.Imap.update({ last_fetched_time: dateFrom }, { where: { email: { "$in": imap_emails } } }, { multi: true })
                                                                                            .then((last_updated_time) => { console.log("last time updated") })
                                                                                    }
                                                                                }
                                                                            });
                                                                        } else {
                                                                            console.log("Data already saved");
                                                                        }
                                                                    });
                                                                });
                                                        })
                                                    })
                                                    console.log(prefix + "Finished");
                                                });
                                                f.once("error", function(err) {
                                                    console.log("Fetch error: " + err);
                                                });
                                                f.once("end", function() {
                                                    console.log("Done fetching all messages!");
                                                    imap.end();
                                                });
                                            } else {
                                                console.log('Nothing to Fetch');
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
                });
            } else {
                console.log("No Active connection")
            }
        });
    }
};