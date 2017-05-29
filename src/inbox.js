import Imap from "imap";
import in_array from "in_array";
import GENERIC from "./modules/generic";
import _ from "lodash";
import db from "./db";
import config from "./config.json";
import mail from "./modules/mail";
import replace from "./modules/replaceVariable";
import automaticTag from "./modules/automatic_tags";

module.exports = {
    fetchEmail: function(email) {
        db.Imap.findAll({
            where: {
                "active": "True"
            }
        }).then(function(docs, err) {
            if (docs) {
                _.forEach(docs, (val) => {
                    var imap = new Imap({
                        user: val.dataValues.email,
                        password: val.dataValues.password,
                        host: val.dataValues.imap_server,
                        port: val.dataValues.server_port,
                        tls: val.dataValues.type,
                    });

                    function openInbox(cb) {
                        imap.openBox("INBOX", true, cb);
                    }
                    var headers = {};
                    imap.once("ready", function() {
                        openInbox(function(err) {
                            if (err) throw err;
                            var delay = 24 * 3600 * 1000;
                            var yesterday = new Date();
                            yesterday.setTime(Date.now() - delay);
                            yesterday = yesterday.toISOString();
                            imap.search(["ALL", ["BEFORE", yesterday]], function(err, results) {
                                if (err) throw err;
                                var UID_arr = [];
                                email.find({}).sort({
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
                                        var f = imap.fetch(UID_arr, {
                                            bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                                            struct: true
                                        });
                                        f.on("message", function(msg, seqno) {
                                            var flag = "";
                                            var uid = "";
                                            var bodyMsg = "";
                                            var prefix = "(#" + seqno + ") ";
                                            msg.on("body", function(stream) {
                                                var buffer = "";
                                                stream.on("data", function(chunk) {
                                                    buffer += chunk.toString("utf8");
                                                });
                                                stream.once("end", function() {
                                                    headers = Imap.parseHeader(buffer);
                                                    var hash = buffer.substring(buffer.indexOf("<div")),
                                                        textmsg = hash.substring(0, hash.lastIndexOf("</div>"));
                                                    if (textmsg !== "") {
                                                        bodyMsg = textmsg + "</div>";
                                                    }
                                                });
                                            });
                                            msg.once("attributes", function(attrs) {
                                                flag = attrs.flags;
                                                uid = attrs.uid;
                                            });
                                            msg.once("end", function() {
                                                var hash1 = headers.from.toString().substring(headers.from.toString().indexOf("\"")),
                                                    from = hash1.substring(0, hash1.lastIndexOf("<"));
                                                var to = headers.to.toString();
                                                var hash = headers.from.toString().substring(headers.from.toString().indexOf("<") + 1),
                                                    sender_mail = hash.substring(0, hash.lastIndexOf(">"));
                                                var date = headers.date.toString(),
                                                    email_date = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1) + "-" + new Date(date).getDate(),
                                                    email_timestamp = new Date(date).getTime(),
                                                    subject = headers.subject.toString(),
                                                    unread = in_array("[]", flag),
                                                    answered = in_array("\\Answered", flag);
                                                automaticTag.tags(subject, function(tag) {
                                                    if (tag) {
                                                        function tagid(tag, callback) {
                                                            var tagid = "";
                                                            var templateid = "";
                                                            if (tag) {
                                                                db.Tag.findOne({
                                                                        where: {
                                                                            title: {
                                                                                like: "%" + tag + "%"
                                                                            }
                                                                        }
                                                                    })
                                                                    .then((docs) => {
                                                                        tagid = docs.id;
                                                                        templateid = docs.template_id;
                                                                        callback(tagid, templateid);
                                                                    });
                                                            } else {
                                                                callback(null);
                                                            }
                                                        }
                                                        tagid(tag, function(tagid, templateid) {
                                                            db.Template.findOne({
                                                                where: {
                                                                    id: templateid
                                                                }
                                                            }).then((data) => {
                                                                if (data && config.boolean === "true") {
                                                                    let email = sender_mail;
                                                                    let subject = data.dataValues.subject;
                                                                    let body = data.dataValues.body;
                                                                    replace.filter(body, from, function(html) {
                                                                        if (html) {
                                                                            mail.mail_alert(email, subject, "template", from, html,
                                                                                function(response_msg, response_data, response) {
                                                                                    if (response) {
                                                                                        console.log("message send successfully")
                                                                                    } else {
                                                                                        console.log("Message not sent")
                                                                                    }
                                                                                });
                                                                        }
                                                                    });
                                                                } else {
                                                                    throw new Error("Message not sent")
                                                                }
                                                            })
                                                            email.findOne({
                                                                uid: uid
                                                            }, function(err, data) {
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
                                                                        unread: unread,
                                                                        answered: answered,
                                                                        uid: uid,
                                                                        body: bodyMsg,
                                                                        tag_id: tagid,
                                                                        genuine_applicant: GENERIC.Genuine_Applicant(subject)
                                                                    });
                                                                    detail.save(function(err) {
                                                                        if (err) {
                                                                            console.log("Duplicate Data");
                                                                        } else {
                                                                            console.log("data saved successfully");
                                                                        }
                                                                    });
                                                                } else {
                                                                    console.log("data already saved");
                                                                }
                                                            })
                                                        })
                                                    }
                                                })
                                                console.log(prefix + "Finished");
                                            });
                                        });
                                        f.once("error", function(err) {
                                            console.log("Fetch error: " + err);
                                        });
                                        f.once("end", function() {
                                            console.log("Done fetching all messages!");
                                            imap.end();
                                        });
                                    }
                                });
                            });
                        });
                    });
                    imap.once("error", function(err) {
                        console.log(err);
                    });
                    imap.once("end", function() {
                        console.log("Connection ended");
                    });
                    imap.connect();
                });
            } else {
                console.log(err);
            }
        });
    },
    beforeDateEmail: function(email, date) {
        db.Imap.findAll({
            where: {
                "active": "True"
            }
        }).then(function(docs, err) {
            if (docs) {
                _.forEach(docs, (val) => {
                    var imap = new Imap({
                        user: val.dataValues.email,
                        password: val.dataValues.password,
                        host: val.dataValues.imap_server,
                        port: val.dataValues.server_port,
                        tls: val.dataValues.type,
                    });

                    function openInbox(cb) {
                        imap.openBox("INBOX", true, cb);
                    }
                    var headers = {};
                    imap.once("ready", function() {
                        openInbox(function(err) {
                            if (err) throw err;
                            imap.search(["ALL", ["BEFORE", date]], function(err, results) {
                                if (err) throw err;
                                var f = imap.seq.fetch(results, {
                                    bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                                    struct: true
                                });
                                f.on("message", function(msg, seqno) {
                                    var flag = "";
                                    var uid = "";
                                    var bodyMsg = "";
                                    var prefix = "(#" + seqno + ") ";
                                    msg.on("body", function(stream) {
                                        var buffer = "";
                                        stream.on("data", function(chunk) {
                                            buffer += chunk.toString("utf8");
                                        });
                                        stream.once("end", function() {
                                            headers = Imap.parseHeader(buffer);
                                            var hash = buffer.substring(buffer.indexOf("<div")),
                                                textmsg = hash.substring(0, hash.lastIndexOf("</div>"));
                                            if (textmsg !== "") {
                                                bodyMsg = textmsg + "</div>";
                                            }
                                        });
                                    });
                                    msg.once("attributes", function(attrs) {
                                        flag = attrs.flags;
                                        uid = attrs.uid;
                                    });
                                    msg.once("end", function() {
                                        var hash1 = headers.from.toString().substring(headers.from.toString().indexOf("\"")),
                                            from = hash1.substring(0, hash1.lastIndexOf("<"));
                                        var to = headers.to.toString();
                                        var hash = headers.from.toString().substring(headers.from.toString().indexOf("<") + 1),
                                            sender_mail = hash.substring(0, hash.lastIndexOf(">"));
                                        var date = headers.date.toString(),
                                            email_date = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1) + "-" + new Date(date).getDate(),
                                            email_timestamp = new Date(date).getTime(),
                                            subject = headers.subject.toString(),
                                            unread = in_array("[]", flag),
                                            answered = in_array("\\Answered", flag);
                                        email.findOne({
                                            uid: uid
                                        }, function(err, data) {
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
                                                    unread: unread,
                                                    answered: answered,
                                                    uid: uid,
                                                    body: bodyMsg,
                                                    genuine_applicant: GENERIC.Genuine_Applicant(subject)
                                                });
                                                detail.save(function(err) {
                                                    if (err) {
                                                        console.log("Duplicate Data");
                                                    } else {
                                                        console.log("data saved successfully");
                                                    }
                                                });
                                            } else {
                                                console.log("data already saved");
                                            }
                                        });
                                        console.log(prefix + "Finished");
                                    });
                                });
                                f.once("error", function(err) {
                                    console.log("Fetch error: " + err);
                                });
                                f.once("end", function() {
                                    console.log("Done fetching all messages!");
                                    imap.end();
                                });
                            });
                        });
                    });
                    imap.once("error", function(err) {
                        console.log(err);
                    });
                    imap.once("end", function() {
                        console.log("Connection ended");
                    });
                    imap.connect();
                });
            } else {
                console.log(err);
            }
        });
    }
};
