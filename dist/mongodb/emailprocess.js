"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _mail = require("../modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _replaceVariable = require("../modules/replaceVariable");

var _replaceVariable2 = _interopRequireDefault(_replaceVariable);

var _imap = require("../service/imap");

var _imap2 = _interopRequireDefault(_imap);

var _getAttachment = require("../modules/getAttachment");

var _getAttachment2 = _interopRequireDefault(_getAttachment);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _pushmessage = require("../service/pushmessage");

var _pushmessage2 = _interopRequireDefault(_pushmessage);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _emaillogs = require("../service/emaillogs");

var _emaillogs2 = _interopRequireDefault(_emaillogs);

var _sendSlackNotification = require("../service/sendSlackNotification");

var _sendSlackNotification2 = _interopRequireDefault(_sendSlackNotification);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fetchEmail = function fetchEmail(page, tag_id, limit, type, keyword, selected, default_id, default_tag, db, is_attach) {
    return new Promise(function (resolve, reject) {
        var message = void 0;
        var default_tag_id = [];
        _.forEach(default_tag, function (val, key) {
            default_tag_id.push(val.id.toString());
        });
        var where = '';
        if (!page || !isNaN(page) == false || page <= 0) {
            page = 1;
        }
        if (type == "email" && !selected && !isNaN(tag_id) == false) {

            where = { 'sender_mail': { "$regex": keyword, '$options': 'i' } };
        } else if (type == "subject" && !selected && !isNaN(tag_id) == false) {

            where = { 'subject': { "$regex": keyword, '$options': 'i' } };
        } else if (type == "email" && selected == true && !isNaN(tag_id) == false) {
            if (default_id) {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id };
            } else {
                if (!is_attach) {
                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [] };
                } else {
                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true };
                }
            }
        } else if (type == "subject" && selected == true && !isNaN(tag_id) == false) {
            if (default_id) {
                where = { 'subject': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id };
            } else {
                if (!is_attach) {
                    where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [] };
                } else {
                    where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true };
                }
            }
        } else if (type == "email" && tag_id) {
            if (default_tag_id.indexOf(default_id) >= 0) {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id };
            } else {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" };
            }
        } else if (type == "subject" && tag_id) {
            if (default_tag_id.indexOf(default_id) >= 0) {
                where = { "subject": { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id };
            } else {
                where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" };
            }
        } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {
            if (!is_attach) {
                where = { tag_id: { $size: 0 }, is_attachment: 0 };
            } else {
                where = { tag_id: { $size: 0 }, is_attachment: 1 };
            }
        } else {
            if (default_tag_id.indexOf(default_id) >= 0) {
                where = { default_tag: default_id, tag_id: { $in: [tag_id] } };
            } else if (default_tag_id.indexOf(tag_id) >= 0) {
                where = { default_tag: tag_id };
            } else {
                where = { tag_id: { $in: [tag_id] }, default_tag: "" };
            }
        }
        db.find(where, { "_id": 1, "date": 1, "email_date": 1, "is_automatic_email_send": 1, "from": 1, "sender_mail": 1, "subject": 1, "unread": 1, "attachment": 1, "tag_id": 1, "is_attachment": 1, "default_tag": 1, "mobile_no": 1 }, { sort: { date: -1 } }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec(function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(data, message);
            }
        });
    });
};

var findcount = function findcount(mongodb) {
    return new Promise(function (resolve, reject) {
        var count1 = [];
        var tagId = [];
        var mails_unread_count = 0;
        var mails_total_count = 0;
        var sub_child_list = [];
        var candidate_list = [];
        var final_data = [];
        _db2.default.Tag.findAll({ where: { type: (0, _constant2.default)().tagType.automatic, is_job_profile_tag: 0 } }).then(function (tags) {
            _.forEach(tags, function (val, key) {
                tagId.push(val);
            });
            _db2.default.Tag.findAll({
                where: { type: (0, _constant2.default)().tagType.automatic, is_job_profile_tag: 1 },
                order: '`priority` ASC'
            }).then(function (candidate) {
                _.forEach(candidate, function (val, key) {
                    candidate_list.push(val);
                });
                mongodb.find({ tag_id: [], is_attachment: false }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function (err, result) {
                    mails_total_count = result.length;
                    _.forEach(result, function (val, key) {
                        if (val.unread === true) {
                            mails_unread_count++;
                        }
                    });
                    findCount(tagId, function (data) {
                        findAttachmentMailsCount(function (attachment_count) {
                            data.push(attachment_count);
                            count1 = [];
                            var mails = { title: "Mails", id: 0, unread: mails_unread_count, count: mails_total_count, type: (0, _constant2.default)().tagType.automatic };
                            data.push(mails);
                            var default_id1 = [];
                            _.forEach(data, function (val, key) {
                                delete val.subchild;
                                final_data.push(val);
                            });
                            _db2.default.Tag.findAll({ where: { type: (0, _constant2.default)().tagType.default } }).then(function (default_tag) {
                                _.forEach(default_tag, function (val, key) {
                                    if (val.title != (0, _constant2.default)().tagType.genuine) {
                                        default_id1.push(val);
                                    }
                                });
                                findCount(candidate_list, function (data1) {
                                    var array = [{ title: "candidate", data: data1 }, { title: "inbox", data: final_data }];
                                    resolve({ data: array });
                                });
                            });
                        });
                    });
                });
            });
        });

        function findAttachmentMailsCount(callback) {
            mongodb.find({ tag_id: [], is_attachment: true }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function (err, result) {
                var attachment_mail_total_count = result.length;
                var attachment_mail_unread_count = 0;
                if (attachment_mail_total_count) {
                    _.forEach(result, function (val, key) {
                        if (val.unread === true) {
                            attachment_mail_unread_count++;
                        }
                        if (key == result.length - 1) {
                            callback({ title: "Attachment", id: null, unread: attachment_mail_unread_count, count: attachment_mail_total_count, type: (0, _constant2.default)().tagType.automatic });
                        }
                    });
                } else {
                    callback({ title: "Attachment", id: null, unread: attachment_mail_unread_count, count: attachment_mail_total_count, type: (0, _constant2.default)().tagType.automatic });
                }
            });
        }

        function findDefaultCount(default_tag_id, callback) {
            if (default_tag_id.length == 0) {
                callback(final_data);
            } else {
                var id1 = default_tag_id.splice(0, 1)[0];
                mongodb.find({ default_tag: id1.id }).exec(function (err, result1) {
                    var unread = 0;
                    _.forEach(result1, function (val, key) {
                        if (val.unread === true) {
                            unread++;
                        }
                    });
                    var default_tag_data = {
                        id: id1.id,
                        color: id1.color,
                        type: id1.type,
                        title: id1.title,
                        count: result1.length,
                        unread: unread
                    };
                    final_data.push(default_tag_data);
                    if (default_tag_id.length) {
                        findDefaultCount(default_tag_id, callback);
                    } else {
                        callback(final_data);
                    }
                });
            }
        }

        function findCount(tag_id, callback) {
            if (tag_id.length == 0) {
                callback(count1);
            } else {
                var _tagId = tag_id.splice(0, 1)[0];
                mongodb.find({ tag_id: { "$in": [_tagId.id.toString()] }, default_tag: "" }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function (err, result) {
                    var unread = 0;
                    _.forEach(result, function (val, key) {
                        if (val.unread === true) {
                            unread++;
                        }
                    });
                    sub_child_list = [];
                    _db2.default.Tag.findAll({ where: { type: (0, _constant2.default)().tagType.default }, order: '`default_id` ASC' }).then(function (default_tag_list) {
                        find_child_count(_tagId, default_tag_list, function (response) {
                            response.id = _tagId.id;
                            response.title = _tagId.title;
                            response.type = _tagId.type;
                            response.color = _tagId.color;
                            response.count = result.length;
                            response.unread = unread;
                            response.subchild.unshift({ id: _tagId.id, title: "All", color: _tagId.color, count: result.length, unread: unread });
                            count1.push(response);
                            if (tag_id.length) {
                                findCount(tag_id, callback);
                            } else {
                                callback(count1);
                            }
                        });
                    });
                });
            }
        }

        function find_child_count(tagId, default_tag_list, callback) {
            var default_tag_id = default_tag_list.splice(0, 1)[0];
            mongodb.find({ tag_id: { "$in": [tagId.id.toString()] }, default_tag: default_tag_id.id }).exec(function (err, default_tag_mail) {
                var child = {
                    id: default_tag_id.id,
                    color: default_tag_id.color,
                    title: default_tag_id.title,
                    count: 0,
                    unread: 0,
                    parent_id: default_tag_id.parent_id
                };
                if (default_tag_mail.length) {
                    child.count = default_tag_mail.length;
                    var unread = 0;
                    _.forEach(default_tag_mail, function (val, key) {
                        if (val.unread === true) {
                            unread++;
                        }
                    });
                    child.unread = unread;
                }
                if (child.parent_id != tagId.id && child.parent_id != null) {
                    // sub_child_list.push(child)
                } else {
                    sub_child_list.push(child);
                }
                if (default_tag_list.length) {
                    find_child_count(tagId, default_tag_list, callback);
                } else {
                    var tagData = {
                        subchild: sub_child_list
                    };
                    callback(tagData);
                }
            });
        }
    });
};

var assignMultiple = function assignMultiple(tag_id, body, email) {
    return new Promise(function (resolve, reject) {
        var where = void 0;
        _db2.default.Tag.findOne({
            where: {
                id: tag_id
            }
        }).then(function (data) {
            if (data.id) {
                if (data.type == (0, _constant2.default)().tagType.default && body.shedule_for) {
                    if (body.shedule_for == (0, _constant2.default)().shedule_for[0].value) {
                        var registration_id = Math.floor(Math.random() * 1000 * 1000 + Math.random() * 10000);
                        where = { "default_tag": tag_id.toString(), "shedule_for": body.shedule_for, "shedule_date": body.shedule_date, "shedule_time": body.shedule_time, "registration_id": registration_id, mobile_no: body.mobile_no, updated_time: new Date(), send_template: body.tamplate_id };
                    } else {
                        where = { "default_tag": tag_id.toString(), "shedule_for": body.shedule_for, "shedule_date": body.shedule_date, "shedule_time": body.shedule_time, mobile_no: body.mobile_no, updated_time: new Date(), send_template: body.tamplate_id };
                    }
                } else if (data.type == (0, _constant2.default)().tagType.default) {
                    where = { "default_tag": tag_id.toString(), "shedule_for": "", "shedule_date": "", "shedule_time": "", updated_time: new Date() };
                } else {
                    where = { "$addToSet": { "tag_id": tag_id.toString() }, updated_time: new Date() };
                }
                email.update({ "_id": { "$in": body.mongo_id } }, where, { multi: true }).exec(function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        if (data.type == (0, _constant2.default)().tagType.default && body.shedule_for) {
                            email.findOne({ "_id": { "$in": body.mongo_id } }, _defineProperty({ "attachment": 1, "sender_mail": 1, "default_tag": 1, "from": 1, "tag_id": 1, "registration_id": 1 }, "from", 1)).exec(function (err, response) {
                                _db2.default.Template.findById(body.tamplate_id).then(function (template) {
                                    _replaceVariable2.default.schedule_filter(template.body, response.from, response.tag_id[response.tag_id.length - 1], body.scheduled_date, body.scheduled_time).then(function (replaced_data) {
                                        if (body.shedule_for == (0, _constant2.default)().shedule_for[0].value) replaced_data = replaced_data + (0, _constant2.default)().registration_message + registration_id;
                                        _db2.default.Smtp.findOne({ where: { status: 1 } }).then(function (smtp) {
                                            if (!smtp) {
                                                resolve({
                                                    status: 1,
                                                    message: "Interview is sheduled but email is not send",
                                                    data: response
                                                });
                                            }
                                            template.subject += " On Dated " + body.shedule_date + " At " + body.shedule_time;
                                            var custom_link = (0, _constant2.default)().app_custom_link + response.registration_id || registration_id;
                                            replaced_data += custom_link;
                                            _mail2.default.sendScheduledMail(response.sender_mail, template.subject, "", smtp, replaced_data).then(function (mail_response) {
                                                _db2.default.Tag.findById(parseInt(response.tag_id[0])).then(function (tag_info) {
                                                    var link = response.attachment[0] ? response.attachment[0].link : "No Attachment";
                                                    var slack_message = (0, _constant2.default)().slack_message + "\n" + "Job Profile: " + tag_info.title + "\n" + "Candidate Name: " + response.from + "\n" + " On Dated " + body.shedule_date + " At " + body.shedule_time + "\n" + "Cv: " + link;
                                                    _sendSlackNotification2.default.slackNotification(slack_message, response.sender_mail).then(function (response) {
                                                        _db2.default.Candidate_device.findOne({ where: { email_id: response.sender_mail } }).then(function (device_list) {
                                                            if (device_list) {
                                                                var push_message = "";
                                                                _.forEach((0, _constant2.default)().shedule_for, function (val, key) {
                                                                    if (val.value == body.shedule_for) {
                                                                        push_message = val.text + " on " + (0, _moment2.default)(body.shedule_date).format("MMM DD, YYYY") + " at " + body.shedule_time;
                                                                    }
                                                                });
                                                                _pushmessage2.default.pushMessage(device_list, push_message).then(function (push_response) {
                                                                    if (!push_response.error) {
                                                                        email.update({ "_id": { "$in": body.mongo_id } }, { "$addToSet": { "push_message": (0, _constant2.default)().push_notification_message + " " + body.shedule_for }, "push_status": 1 }, { multi: true }).exec(function (err, saved_info) {
                                                                            resolve({
                                                                                status: 1,
                                                                                message: "success",
                                                                                data: response,
                                                                                push_status: push_response,
                                                                                email_status: mail_response
                                                                            });
                                                                        });
                                                                    } else {
                                                                        resolve({
                                                                            status: 1,
                                                                            message: "success",
                                                                            data: response,
                                                                            push_status: push_response,
                                                                            email_status: mail_response
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                resolve({
                                                                    status: 1,
                                                                    message: "success",
                                                                    data: response,
                                                                    email_status: mail_response
                                                                });
                                                            }
                                                        }, function (err) {
                                                            reject(err);
                                                        });
                                                    }, function (err) {
                                                        reject(err);
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        } else {
                            resolve({
                                status: 1,
                                message: "success",
                                email_status: { status: 0 }
                            });
                        }
                    }
                });
            } else {
                reject("invalid tag id");
            }
        });
    });
};

var fetchById = function fetchById(type, keyword, selected, default_id, tag_id, is_attach) {
    return new Promise(function (resolve, reject) {
        _db2.default.Tag.findAll({ where: { type: (0, _constant2.default)().tagType.default } }).then(function (default_tag) {
            var default_tag_id = [];
            _.forEach(default_tag, function (val, key) {
                default_tag_id.push(val.id.toString());
            });
            var where = "";
            if (type == "email" && !selected && !isNaN(tag_id) == false) {

                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' } };
            } else if (type == "subject" && !selected && !isNaN(tag_id) == false) {

                where = { 'subject': { "$regex": keyword, '$options': 'i' } };
            } else if (type == "email" && selected == true && !isNaN(tag_id) == false) {
                if (default_id) {
                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id };
                } else {
                    if (!is_attach) {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [] };
                    } else {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true };
                    }
                }
            } else if (type == "subject" && selected == true && !isNaN(tag_id) == false) {
                if (default_id) {
                    where = { 'subject': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id };
                } else {
                    if (!is_attach) {
                        where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [] };
                    } else {
                        where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true };
                    }
                }
            } else if (type == "email" && tag_id) {
                if (default_tag_id.indexOf(default_id) >= 0) {
                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id };
                } else {
                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" };
                }
            } else if (type == "subject" && tag_id) {
                if (default_tag_id.indexOf(default_id) >= 0) {
                    where = { "subject": { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id };
                } else {
                    where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" };
                }
            } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {
                if (!is_attach) {
                    where = { tag_id: { $size: 0 }, is_attachment: 0 };
                } else {
                    where = { tag_id: { $size: 0 }, is_attachment: 1 };
                }
            } else {
                if (default_tag_id.indexOf(default_id) >= 0) {
                    where = { default_tag: default_id, tag_id: { $in: [tag_id] } };
                } else if (default_tag_id.indexOf(tag_id) >= 0) {
                    where = { default_tag: tag_id };
                } else {
                    where = { tag_id: { $in: [tag_id] }, default_tag: "" };
                }
            }
            resolve(where);
        });
    });
};

var sendToMany = function sendToMany(req, email_list, subject, body, tag_id, default_id, email) {
    return new Promise(function (resolve, reject) {
        var where = void 0;
        var emails = [];
        if (tag_id && default_id) {
            where = { "tag_id": { "$in": [tag_id.toString()] }, "default_tag": default_id.toString() };
        } else {
            where = { tag_id: { "$in": [tag_id.toString()] }, "default_tag": "" };
        }
        if (tag_id) {
            email.find({ "$and": [where] }).exec(function (err, data) {
                _.forEach(data, function (val, key) {
                    emails.push(val.sender_mail);
                    if (key == data.length - 1) {
                        var _data = new req.cronWork({ body: req.body.body, tag_id: tag_id.toString(), subject: req.body.subject, user: req.user.email, candidate_list: emails, status: 1, work: (0, _constant2.default)().sendToAll, template_id: req.body.template_id });
                        _data.save(function (err, response) {
                            resolve(response);
                        });
                    }
                });
            });
        }
    });
};

var sendToSelectedTag = function sendToSelectedTag(req, id, email) {
    return new Promise(function (resolve, reject) {
        var email_send_success_list = [];
        var email_send_fail_list = [];
        _db2.default.Tag.findById(id).then(function (data) {
            if (data) {
                _db2.default.Template.findById(data.template_id).then(function (template) {
                    if (template) {
                        email.find({ 'tag_id': { $in: [id.toString()] }, "$or": [{ is_automatic_email_send: 0 }, { is_automatic_email_send: { "$exists": false } }] }, { "_id": 1, "sender_mail": 1, "from": 1, "subject": 1, "tag_id": 1 }).exec(function (err, result) {
                            var data = new req.cronWork({ tag_id: id.toString(), candidate_list: result, template_id: template.id, user: req.user.email, work: (0, _constant2.default)().pending_work, status: 1 });
                            data.save(function (err, response) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ status: 0, message: "Send email to pending candidate is started..", data: [] });
                                }
                            });
                        });
                    } else {
                        reject("No template found");
                    }
                });
            } else {
                reject("Invalid Tag id");
            }
        });
    });
};

var mailAttachment = function mailAttachment(mongo_id, email) {
    return new Promise(function (resolve, reject) {
        email.findOne({ _id: mongo_id }, function (error, data) {
            if (error) {
                reject(error);
            } else {
                if (data) {
                    var to = data.get("imap_email");
                    var uid = data.get("uid");
                    if (to && uid) {
                        _db2.default.Imap.findOne({ where: { email: to } }).then(function (data) {
                            _imap2.default.imapCredential(data).then(function (imap) {
                                _getAttachment2.default.getAttachment(imap, uid).then(function (response) {
                                    email.findOneAndUpdate({ _id: mongo_id }, { $set: { attachment: response } }, { new: true }, function (err, response) {
                                        if (err) {
                                            resolve({ status: 0, message: err });
                                        } else {
                                            resolve({ status: 1, message: " attachment save successfully", data: response });
                                        }
                                    });
                                });
                            });
                        });
                    } else {
                        resolve({ status: 0, message: 'data not found in database' });
                    }
                } else {
                    resolve({ status: 0, message: 'mongo_id not found in database' });
                }
            }
        });
    });
};

var deleteEmail = function deleteEmail(tag_id, mongo_id, email) {
    return new Promise(function (resolve, reject) {
        var response = [];
        var size = _.size(mongo_id);
        _.forEach(mongo_id, function (val, key) {
            email.findOneAndUpdate({ "_id": val }, { "$pull": { "tag_id": tag_id } }, { new: true }).exec(function (err, data) {
                if (err) {
                    response.push({ status: 0, message: err, array_length: key });
                }
                if (!data) {
                    response.push({ status: 0, msg: "not found", array_length: key });
                } else {
                    if (!_.size(data.tag_id)) {
                        data.remove();
                    }
                    response.push({ status: 1, msg: "delete success", array_length: key });
                }
                if (key == mongo_id.length - 1) {
                    resolve({ status: 1, message: "success", data: response });
                }
            });
        });
    });
};

var deleteTag = function deleteTag(tag_id, mongo_id, email) {
    return new Promise(function (resolve, reject) {
        _db2.default.Tag.findOne({ where: { id: tag_id } }).then(function (data) {
            if (data.id) {
                _.each(mongo_id, function (val, key) {
                    email.findOneAndUpdate({ "_id": val }, { "$pull": { "tag_id": tag_id } }).exec(function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            if (key == _.size(mongo_id) - 1) {
                                resolve({ status: 1, message: "success" });
                            }
                        }
                    });
                });
            } else {
                reject("invalid tag id");
            }
        });
    });
};

var getShedule = function getShedule(email) {
    return new Promise(function (resolve, reject) {
        var slots_array = [];
        var list_array = [];
        var final_data_list = {};
        var lastDate = (0, _moment2.default)(new Date()).add(1, 'months');
        var rounds = [];
        getDates((0, _moment2.default)(new Date()).add(1, 'days'), lastDate, function (dateArray) {
            _.forEach((0, _constant2.default)().shedule_for, function (val, key) {
                rounds.push({ round: val.text });
                if (key == (0, _constant2.default)().shedule_for.length - 1) {
                    dateArray[0]['rounds'] = rounds;
                    resolve(dateArray);
                }
            });
        });

        function getDates(startDate, stopDate, callback) {
            var week_of_month = [1, 2, 3, 4, 5];
            var currentDate = (0, _moment2.default)(startDate);
            stopDate = (0, _moment2.default)(stopDate);
            if (!((0, _moment2.default)(currentDate).day() == 6 && !(week_of_month[0 | (0, _moment2.default)(currentDate).date() / 7] % 2))) {
                if (!(0, _moment2.default)(currentDate).day() == 0) {
                    getTimeSlots(currentDate, function (time_slots) {
                        currentDate = (0, _moment2.default)(currentDate).add(1, 'days');
                        if (startDate <= stopDate) {
                            getDates(currentDate, stopDate, callback);
                        } else {
                            callback(time_slots);
                        }
                    });
                } else {
                    currentDate = (0, _moment2.default)(currentDate).add(1, 'days');
                    getDates(currentDate, stopDate, callback);
                }
            } else {
                currentDate = (0, _moment2.default)(currentDate).add(1, 'days');
                getDates(currentDate, stopDate, callback);
            }
        }

        function getTimeSlots(currentDate, callback) {
            slots_array = [];
            final_data_list = {};
            var shedule_for = (0, _constant2.default)().shedule_for;
            var shedule_time_slots = [(0, _constant2.default)().first_round_slots, (0, _constant2.default)().second_round_slots, (0, _constant2.default)().third_round_slots];
            check_slot_status(shedule_for, shedule_time_slots, currentDate, function (response) {
                list_array.push({ date: currentDate.toISOString().substring(0, 10), time_slots: response });
                callback(list_array);
            });
        }

        function check_slot_status(shedule_type, shedule_slots, date, callback) {
            var shedule = shedule_type.splice(0, 1)[0];
            var slots = shedule_slots.splice(0, 1)[0];
            email.find({ shedule_date: date.toISOString().substring(0, 10), shedule_for: shedule.value }, { "shedule_time": 1 }).exec(function (err, shedule_time) {
                if (shedule_time.length) {
                    var time = [];
                    _.forEach(shedule_time, function (val, key) {
                        time.push(val.shedule_time);
                    });
                    _.forEach(slots, function (val, key) {
                        if (time.indexOf(val) >= 0) {
                            slots_array.push({ time: time[time.indexOf(val)], status: 0 });
                        } else {
                            slots_array.push({ time: val, status: 1 });
                        }
                        if (key == slots.length - 1) {
                            final_data_list[shedule.value] = slots_array;
                            if (shedule_type.length) {
                                slots_array = [];
                                check_slot_status(shedule_type, shedule_slots, date, callback);
                            } else {
                                final_data_list[shedule.value] = slots_array;
                                callback(final_data_list);
                            }
                        }
                    });
                } else {
                    _.forEach(slots, function (val, key) {
                        slots_array.push({ time: val, status: 1 });
                        if (key == slots.length - 1) {
                            final_data_list[shedule.value] = slots_array;
                            if (shedule_type.length) {
                                slots_array = [];
                                check_slot_status(shedule_type, shedule_slots, date, callback);
                            } else {
                                final_data_list[shedule.value] = slots_array;
                                callback(final_data_list);
                            }
                        }
                    });
                }
            });
        }
    });
};

var assignToOldTag = function assignToOldTag(data, email) {
    return new Promise(function (resolve, reject) {
        _db2.default.Tag.assignTag(data, email).then(function (response) {
            function assignTag(id) {
                var mongoId = id.splice(0, 100);
                email.update({ _id: { $in: mongoId } }, { "$addToSet": { "tag_id": data.id.toString() }, "email_timestamp": new Date().getTime() }, { multi: true }).then(function (data1) {
                    if (!id.length) {
                        resolve({ message: "tag assigned sucessfully" });
                    } else {
                        assignTag(id);
                    }
                });
            }
            assignTag(response);
        }, function (err) {
            reject(err);
        });
    });
};

var assignToNewTag = function assignToNewTag(data, email) {
    return new Promise(function (resolve, reject) {
        _db2.default.Tag.assignNewTag(data, email).then(function (response) {
            function assignTag(id) {
                var mongoId = id.splice(0, 100);
                email.update({ _id: { $in: mongoId } }, { "default_tag": data.id.toString(), "email_timestamp": new Date().getTime() }, { multi: true }).then(function (data1) {
                    if (!id.length) {
                        resolve({ message: "tag assigned sucessfully" });
                    } else {
                        assignTag(id);
                    }
                });
            }
            assignTag(response);
        }, function (err) {
            reject(err);
        });
    });
};

var getFetchedMailCount = function getFetchedMailCount(imap_emails, email) {
    return new Promise(function (resolve, reject) {
        var result = [];
        findCount(imap_emails, function (data) {
            resolve(result);
        });

        function findCount(emails, callback) {
            var imap_data = "";
            var imap_email = emails.splice(0, 1)[0];
            if (!imap_email) {
                callback({});
            } else {
                email.find({ imap_email: imap_email.email }).count().exec(function (err, data) {
                    imap_data = {
                        active: imap_email.active,
                        createdAt: imap_email.createdAt,
                        email: imap_email.email,
                        id: imap_email.id,
                        imap_server: imap_email.imap_server,
                        password: imap_email.password,
                        server_port: imap_email.port,
                        status: imap_email.status,
                        type: imap_email.type,
                        updatedAt: imap_email.updatedAt,
                        fetched_email_count: data,
                        fetched_mail_till: (0, _moment2.default)(imap_email.last_fetched_time).format("DD,MM,YYYY"),
                        total_emails: imap_email.total_emails,
                        days_left_to_fetched: imap_email.days_left_to_fetched
                    };
                    result.push(imap_data);
                    if (emails.length) {
                        findCount(emails, callback);
                    } else {
                        callback(result);
                    }
                });
            }
        }
    });
};

var app_get_candidate = function app_get_candidate(email, registration_id) {
    return new Promise(function (resolve, reject) {
        var rounds = [];
        var scheduled_rounds = [];
        _.forEach((0, _constant2.default)().shedule_for, function (val, key) {
            scheduled_rounds.push(val.value);
        });
        email.findOne({ shedule_for: { "$in": scheduled_rounds }, registration_id: registration_id }, { "from": 1, "tag_id": 1, "shedule_date": 1, "shedule_time": 1, "shedule_for": 1, "push_message": 1, "push_status": 1, "registration_id": 1, "sender_mail": 1, "mobile_no": 1 }).exec(function (err, response) {
            if (err) {
                reject({ error: 1, message: "Invalid Registration Number", data: [] });
            } else {
                if (response) {
                    _.each((0, _constant2.default)().shedule_for, function (val, key) {
                        rounds.push(val.value == response.shedule_for ? { text: val.text, info: val.info, scheduled_time: response.shedule_time, scheduled_date: (0, _moment2.default)(response.shedule_date).format("MMM DD, YYYY"), status: 1 } : { text: val.text, info: val.info, scheduled_time: "", scheduled_date: "", status: 0 });
                        if (key == (0, _constant2.default)().shedule_for.length - 1 || val.value == response.shedule_for) {
                            _db2.default.Tag.findTagInfo(response.tag_id[0]).then(function (tagInfo) {
                                resolve({ name: response.from, mobile_no: response.mobile_no || null, email: response.sender_mail, subject: tagInfo.subject, job_description: tagInfo.job_description, rounds: rounds, push_message: response.push_message, push_status: response.push_status, registration_id: response.registration_id, office_location: (0, _constant2.default)().office_location, app_hr_contact_email: (0, _constant2.default)().app_hr_contact_email, app_hr_contact_number: (0, _constant2.default)().app_hr_contact_number, job_title: tagInfo.title });
                            }, function (error) {
                                reject(error);
                            });
                            return false;
                        }
                    });
                } else {
                    reject({ error: 1, message: "Invalid Registration Number", data: [] });
                }
            }
        });
    });
};

var checkEmailStatus = function checkEmailStatus(req) {
    return new Promise(function (resolve, reject) {
        var rounds = [];
        var flag = 0;
        _.forEach((0, _constant2.default)().shedule_for, function (val, key) {
            rounds.push(val.value);
        });
        req.email.findOne({ sender_mail: req.body.email, tag_id: req.body.tag_id.toString(), shedule_for: { $in: rounds } }, { "shedule_for": 1 }).exec(function (err, email_data) {
            if (err) {
                reject(err);
            } else if (!email_data) {
                flag++;
            } else if (email_data._id == req.body.mongo_id) {
                flag++;
            }
            resolve({ flag: flag, message: flag ? "" : "Candidate is Already Scheduled" });
        });
    });
};

var findEmailByDates = function findEmailByDates(days) {
    return new Promise(function (resolve, reject) {
        _db2.default.Imap.update({ fetched_date_till: new Date(), days_left_to_fetched: days }, { where: { active: 1 } }).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            reject(err);
        });
    });
};

var sendToNotReplied = function sendToNotReplied(req) {
    return new Promise(function (resolve, reject) {
        var sender_mail_array = [];
        _db2.default.Tag.findOne({ where: { title: (0, _constant2.default)().tagType.genuine } }).then(function (default_tag) {
            req.email.find({ tag_id: req.body.tag_id, default_tag: default_tag.id.toString() }, { sender_mail: 1 }).then(function (sender_mail_data) {
                _.forEach(sender_mail_data, function (val, key) {
                    sender_mail_array.push(val.sender_mail);
                    if (key == sender_mail_data.length - 1) {
                        req.email.find({ tag_id: req.body.tag_id.toString(), sender_mail: { $not: { $in: sender_mail_array } }, default_tag: "", "$or": [{ send_template_count: { "$exists": false } }, { send_template_count: { $lte: 3 } }], template_id: { $ne: parseInt(req.body.template_id) } }, { sender_mail: 1, from: 1 }).then(function (candidate_list) {
                            var data = new req.cronWork({ body: req.body.body, subject: req.body.subject, user: req.user.email, tag_id: req.body.tag_id, default_tag: req.body.default_tag, candidate_list: candidate_list, status: 1, work: (0, _constant2.default)().not_replied, template_id: req.body.template_id });
                            data.save(function (err, response) {
                                resolve({ no_of_candidate: candidate_list.length, message: "CronWork Is Started..." });
                            });
                        });
                    }
                });
            });
        });
    });
};

var sendBySelection = function sendBySelection(req) {
    return new Promise(function (resolve, reject) {
        var sender_mail_array = [];
        var data = new req.cronWork({ body: req.body.body, subject: req.body.subject, user: req.user.email, candidate_list: req.body.emails, status: 1, work: (0, _constant2.default)().selectedCandidate, template_id: req.body.template_id });
        data.save(function (err, response) {
            resolve({ no_of_candidate: req.body.emails.length, message: "CronWork Is Started..." });
        });
    });
};

var insert_note = function insert_note(req) {
    return new Promise(function (resolve, reject) {
        req.email.update({ "_id": req.body.mongo_id }, { "$push": { "notes": { $each: [{ note: req.body.note, date: (0, _moment2.default)(new Date()).format("DD-MM-YYYY"), time: (0, _moment2.default)(new Date()).format("hh:mm:ss a"), assignee: req.user.email }] } } }).exec(function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve({ error: 0, message: "Note inserted", response: result });
            }
        });
    });
};

var update_note = function update_note(req) {
    return new Promise(function (resolve, reject) {
        req.email.update({ "_id": req.body.mongo_id, "notes.date": req.body.note_date, "notes.time": req.body.note_time }, { $set: { "notes.$.note": req.body.note, "notes.$.date": (0, _moment2.default)(new Date()).format("DD-MM-YYYY"), "notes.$.time": (0, _moment2.default)(new Date()).format("hh:mm:ss a") } }).exec(function (err, result) {
            if (err) {
                reject(err);
            } else {
                if (result.nModified) {
                    resolve({ error: 0, message: "Note updated" });
                } else {
                    resolve({ error: 0, message: "Note not found" });
                }
            }
        });
    });
};

var cron_status = function cron_status(req) {
    return new Promise(function (resolve, reject) {
        findCronStatus(req.body, function (response) {
            resolve(response);
        });
    });

    function findCronStatus(data, callback) {
        findPendingCandidate(data, function (pending_candidate_status) {
            sendToAll(data, function (send_to_all_status) {
                notRepliedCandidate(data, function (notRepliedCandidate) {
                    var response = {
                        pending_candidate_status: pending_candidate_status,
                        send_to_all_status: send_to_all_status,
                        notRepliedCandidate: notRepliedCandidate
                    };
                    callback(response);
                });
            });
        });
    }

    function findPendingCandidate(data, callback) {
        req.cronWork.find({ status: 1, work: (0, _constant2.default)().pending_work, tag_id: data.tag_id.toString }).then(function (pending_candidate) {
            var count = 0;
            if (pending_candidate.length) {
                _.forEach(pending_candidate, function (val, key) {
                    count += val.get('candidate_list').length;
                    if (key == pending_candidate.length - 1) {
                        callback(count);
                    }
                });
            } else {
                callback(count);
            }
        });
    }

    function sendToAll(data, callback) {
        req.cronWork.find({ status: 1, work: (0, _constant2.default)().sendToAll, tag_id: data.tag_id.toString }).then(function (pending_candidate) {
            var count = 0;
            if (pending_candidate.length) {
                var _count = 0;
                _.forEach(pending_candidate, function (val, key) {
                    _count += val.get('candidate_list').length;
                    if (key == pending_candidate.length - 1) {
                        callback(_count);
                    }
                });
            } else {
                callback(count);
            }
        });
    }

    function notRepliedCandidate(data, callback) {
        req.cronWork.find({ status: 1, work: (0, _constant2.default)().not_replied, tag_id: data.tag_id.toString }).then(function (pending_candidate) {
            var count = 0;
            if (pending_candidate.length) {
                _.forEach(pending_candidate, function (val, key) {
                    count += val.get('candidate_list').length;
                    if (key == pending_candidate.length - 1) {
                        callback(count);
                    }
                });
            } else {
                callback(count);
            }
        });
    }
};

var archiveEmails = function archiveEmails(body, source, target) {
    return new Promise(function (resolve, reject) {
        source.find({ tag_id: body.tag_id }).then(function (mails) {
            target.insertMany(mails).then(function (write_reponse) {
                source.remove({ tag_id: body.tag_id || [] }).then(function (response) {
                    resolve({ status: 1, message: "All Emails are moved to Archived" });
                });
            });
        });
    });
};

exports.default = {
    fetchEmail: fetchEmail,
    findcount: findcount,
    assignMultiple: assignMultiple,
    fetchById: fetchById,
    sendToMany: sendToMany,
    sendToSelectedTag: sendToSelectedTag,
    mailAttachment: mailAttachment,
    deleteEmail: deleteEmail,
    deleteTag: deleteTag,
    getShedule: getShedule,
    assignToOldTag: assignToOldTag,
    assignToNewTag: assignToNewTag,
    getFetchedMailCount: getFetchedMailCount,
    app_get_candidate: app_get_candidate,
    checkEmailStatus: checkEmailStatus,
    findEmailByDates: findEmailByDates,
    sendToNotReplied: sendToNotReplied,
    sendBySelection: sendBySelection,
    insert_note: insert_note,
    update_note: update_note,
    cron_status: cron_status,
    archiveEmails: archiveEmails
};
//# sourceMappingURL=emailprocess.js.map