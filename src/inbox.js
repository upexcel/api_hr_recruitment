import Imap from "imap";
import in_array from "in_array";
import GENERIC from "./modules/generic";
import _ from "lodash";
import db from "./db";
import config from "./config.json";
import mail from "./modules/mail";
import replace from "./modules/replaceVariable";
import automaticTag from "./modules/automaticTags";
import imapService from "./service/imap";
import moment from "moment";
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
                    _.forEach(docs, (val) => {
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
                                                                    parser.on("data", data => {
                                                                        if (data.text) {
                                                                            var html = data.text.substr((data.text.indexOf("<html>") - 7) || (data.text.indexOf("<!DOCTYPE html>" - 16) - 7)).substr(7, data.text.substr(data.text.indexOf("<html>") - 7).indexOf('</html>'))
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
                                                                            automaticTag.tags(subject, date, from, sender_mail, val.dataValues.email)
                                                                                .then((tag) => {
                                                                                    if (tag.tagId.length) {
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
                                                                                                unread: unread,
                                                                                                answered: answered,
                                                                                                uid: uid,
                                                                                                body: body,
                                                                                                tag_id: tag.tagId,
                                                                                                imap_email: val.dataValues.email,
                                                                                                genuine_applicant: GENERIC.Genuine_Applicant(subject)
                                                                                            });
                                                                                            detail.save(function(err) {
                                                                                                if (err) {
                                                                                                    console.log("Duplicate Data");
                                                                                                } else {
                                                                                                    console.log(tag)
                                                                                                    console.log("data saved successfully");
                                                                                                    if (!count && apiCall) {
                                                                                                        resolve({ message: "All data fetched successfully" });
                                                                                                    }
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            console.log('Data already saved');
                                                                                            if (!count && apiCall) {
                                                                                                resolve({ message: "All data fetched successfully" });
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
                _.forEach(docs, (val) => {
                    imapService.imapCredential(val)
                        .then((imap) => {
                            var headers = {};
                            imap.once("ready", function() {
                                imapService.imapConnection(imap)
                                    .then((response) => {
                                        email.find({ imap_email: val.dataValues.email }).sort({
                                            uid: 1
                                        }).limit(1).exec(function(err, resp) {
                                            let date = '';
                                            let dateFrom = '';
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                var row = resp[0];
                                                if (row && row.get("date")) {
                                                    date = moment(new Date(row.get("date"))).format("MMM DD, YYYY");
                                                    dateFrom = moment(date).subtract(1, 'months').format('MMM DD, YYYY');
                                                } else {
                                                    date = moment(new Date()).format("MMM DD, YYYY");
                                                    dateFrom = moment(date).subtract(1, 'months').format('MMM DD, YYYY');
                                                }
                                                imap.search(['ALL', ['SINCE', dateFrom],
                                                    ['BEFORE', date]
                                                ], function(err, results) {
                                                    if (err) {
                                                        console.log(err)
                                                    } else if (results.length) {
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
                                                                    automaticTag.tags(subject, date, from, sender_mail, val.dataValues.email)
                                                                        .then((tag) => {
                                                                            if (tag.tagId.length) {
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
                                                                                        unread: unread,
                                                                                        answered: answered,
                                                                                        uid: uid,
                                                                                        body: body,
                                                                                        tag_id: tag.tagId,
                                                                                        imap_email: val.dataValues.email,
                                                                                        genuine_applicant: GENERIC.Genuine_Applicant(subject)
                                                                                    });
                                                                                    detail.save(function(err) {
                                                                                        if (err) {
                                                                                            console.log("Duplicate Data");
                                                                                        } else {
                                                                                            console.log(tag)
                                                                                            console.log("data saved successfully");
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
