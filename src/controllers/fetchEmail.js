import BaseAPIController from "./BaseAPIController";
import MailProvider from "../providers/MailProvider";
import Attachment from "../modules/getAttachment";
import imap from "../service/imap";
import * as _ from "lodash";
import inbox from "../inbox";
import db from "../db";
import mail from "../modules/mail";
import constant from "../models/constant";
import replaceData from "../modules/replaceVariable";


export class FetchController extends BaseAPIController {
    /* Get INBOX data */
    fetch = (req, res, next) => {
        let { page, tag_id, limit } = req.params;
        let { type, keyword, selected, default_id } = req.body;
        this._db.Tag.findAll({ where: { type: "Default" } })
            .then((default_tag) => {
                var default_tag_id = []
                _.forEach(default_tag, (val, key) => {
                    default_tag_id.push(val.id.toString())
                })
                var where = '';
                if (!page || !isNaN(page) == false || page <= 0) {
                    page = 1;
                }
                if ((type == "email") && (!selected) && (!isNaN(tag_id) == false)) {

                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' } }
                } else if ((type == "subject") && (!selected) && (!isNaN(tag_id) == false)) {

                    where = { 'subject': { "$regex": keyword, '$options': 'i' } }
                } else if ((type == "email") && (selected == true) && ((!isNaN(tag_id) == false))) {
                    if (default_id) {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id }
                    } else {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [] }
                    }
                } else if ((type == "subject") && (selected == true) && (!isNaN(tag_id) == false)) {
                    if (default_id) {
                        where = { 'subject': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id }
                    } else {
                        where = { 'subject': { "$regex": keyword, '$options': 'i' }, 'tag_id': [] }
                    }

                } else
                if ((type == "email") && tag_id) {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id }
                    } else {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id }
                    }
                } else if ((type == "subject") && tag_id) {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { "subject": { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id }
                    } else {
                        where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id }
                    }
                } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {

                    where = { tag_id: { $size: 0 } };
                } else {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { default_tag: default_id, tag_id: { $in: [tag_id] } }
                    } else if (default_tag_id.indexOf(tag_id) >= 0) {
                        where = { default_tag: tag_id }
                    } else {
                        where = { tag_id: { $in: [tag_id] } }
                    }
                }
                console.log(where)
                req.email.find(where, { "_id": 1, "date": 1, "email_date": 1, "is_automatic_email_send": 1, "from": 1, "sender_mail": 1, "subject": 1, "unread": 1, "attachment": 1, "tag_id": 1, "is_attachment": 1, "default_tag": 1 }).sort({ date: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec((err, data) => {
                    if (err) {
                        next(err);
                    } else {
                        if (data[0] == null) {
                            var message = "No Result Found"
                        }
                        res.json({
                            data: data,
                            status: 1,
                            count: req.count,
                            message: message || "success"
                        });
                    }
                });
            })
    }

    assignTag = (req, res, next) => {
        let { tag_id, mongo_id } = req.params;
        this._db.Tag.findOne({
                where: { id: tag_id }
            })
            .then((data) => {
                if (data.id) {
                    req.email.findOneAndUpdate({
                        "_id": mongo_id
                    }, {
                        "$addToSet": {
                            "tag_id": tag_id
                        },
                        email_timestamp: new Date().getTime()
                    }).exec((err, data) => {
                        if (err) {
                            next(new Error(err));
                        } else {
                            res.json({
                                data: data,
                                status: 1,
                                message: "success"
                            });
                        }
                    });
                } else {
                    next(new Error("invalid tag id"));
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    countEmail = (req, res, next) => {
        var count1 = [];
        var tagId = [];
        var mails_unread_count = 0;
        var mails_total_count = 0;
        var sub_child_list = [];
        var candidate_list = [];
        var final_data = [];
        this._db.Tag.findAll({ where: { type: "Automatic", is_job_profile_tag: 0 } })
            .then((tags) => {
                _.forEach(tags, (val, key) => {
                    tagId.push(val)
                })
                this._db.Tag.findAll({ where: { type: "Automatic", is_job_profile_tag: 1 } })
                    .then((candidate) => {
                        _.forEach(candidate, (val, key) => {
                            candidate_list.push(val)
                        })
                        req.email.find({ tag_id: [] }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
                            mails_total_count = result.length;
                            _.forEach(result, (val, key) => {
                                if (val.unread === true) {
                                    mails_unread_count++;
                                }
                            })
                            findCount(tagId, function(data) {
                                count1 = []
                                var mails = { title: "Mails", id: 0, unread: mails_unread_count, count: mails_total_count, type: "Automatic" }
                                data.push(mails)
                                var default_id1 = [];
                                _.forEach(data, (val, key) => {
                                    delete val.subchild
                                    final_data.push(val)
                                })
                                db.Tag.findAll({ where: { type: "Default" } })
                                    .then((default_tag) => {
                                        _.forEach(default_tag, (val, key) => {
                                            default_id1.push(val);
                                        })
                                        findDefaultCount(default_id1, function(resp) {
                                            findCount(candidate_list, function(data1) {
                                                var array = [{ title: "candidate", data: data1 }, { title: "inbox", data: final_data }, { subject_for_genuine: constant().automatic_mail_subject }]
                                                res.json({ data: array })
                                            })
                                        })
                                    })

                            })
                        })
                    })
            })

        function findDefaultCount(default_tag_id, callback) {
            if (default_tag_id.length == 0) {
                callback(final_data)
            } else {
                var id1 = default_tag_id.splice(0, 1)[0];
                req.email.find({ default_tag: id1.id }).exec(function(err, result1) {
                    var unread = 0;
                    _.forEach(result1, (val, key) => {
                        if (val.unread === true) {
                            unread++;
                        }
                    })
                    var default_tag_data = {
                        id: id1.id,
                        color: id1.color,
                        type: id1.type,
                        title: id1.title,
                        count: result1.length,
                        unread: unread,
                    }
                    final_data.push(default_tag_data)
                    if (default_tag_id.length) {
                        findDefaultCount(default_tag_id, callback)
                    } else {
                        callback(final_data)
                    }
                })
            }
        }

        function findCount(tag_id, callback) {
            if (tag_id.length == 0) {
                callback(count1)
            } else {
                var tagId = tag_id.splice(0, 1)[0]
                req.email.find({ tag_id: { "$in": [tagId.id.toString()] } }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
                    var unread = 0
                    _.forEach(result, (val, key) => {
                        if (val.unread === true) {
                            unread++;
                        }
                    })
                    sub_child_list = []
                    db.Tag.findAll({ where: { type: "Default" } })
                        .then((default_tag_list) => {
                            find_child_count(tagId, default_tag_list, function(response) {
                                response.id = tagId.id;
                                response.title = tagId.title;
                                response.type = tagId.type;
                                response.color = tagId.color;
                                response.count = result.length;
                                response.unread = unread;
                                response.subchild.unshift({ id: tagId.id, title: "All", color: tagId.color, count: result.length, unread: unread })
                                count1.push(response)
                                if (tag_id.length) {
                                    findCount(tag_id, callback)
                                } else {
                                    callback(count1)
                                }
                            })
                        })

                })
            }
        }

        function find_child_count(tagId, default_tag_list, callback) {
            var default_tag_id = default_tag_list.splice(0, 1)[0]
            req.email.find({ tag_id: { "$in": [tagId.id.toString()] }, default_tag: default_tag_id.id }).exec(function(err, default_tag_mail) {
                var child = {
                    id: default_tag_id.id,
                    color: default_tag_id.color,
                    title: default_tag_id.title,
                    count: 0,
                    unread: 0
                }
                if (default_tag_mail.length) {
                    child.count = default_tag_mail.length
                    var unread = 0
                    _.forEach(default_tag_mail, (val, key) => {
                        if (val.unread === true) {
                            unread++;
                        }
                    })
                    child.unread = unread
                }
                if (child.title != constant().tagType.genuine) {
                    sub_child_list.push(child)
                }
                if (default_tag_list.length) {
                    find_child_count(tagId, default_tag_list, callback)
                } else {
                    var tagData = {
                        subchild: sub_child_list
                    }
                    callback(tagData)
                }

            })
        }
    }

    assignMultiple = (req, res, next) => {
        MailProvider.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                let { tag_id, parent_id } = req.params;
                this._db.Tag.findOne({
                        where: {
                            id: tag_id
                        }
                    })
                    .then((data) => {
                        if (data.id) {
                            _.each(req.body.mongo_id, (val, key) => {
                                if (data.type == "Default") {
                                    var where = { "default_tag": tag_id.toString(), "email_timestamp": new Date().getTime() };
                                } else {
                                    where = { "$addToSet": { "tag_id": tag_id }, "email_timestamp": new Date().getTime() };
                                }
                                req.email.findOneAndUpdate({ "_id": val }, where).exec((err) => {
                                    if (err) {
                                        next(new Error(err));
                                    } else {
                                        if (key == (_.size(req.body.mongo_id) - 1)) {
                                            res.json({
                                                status: 1,
                                                message: "success"
                                            });
                                        }
                                    }
                                });
                            });
                        } else {
                            next(new Error("invalid tag id"));
                        }
                    })
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    deleteTag = (req, res, next) => {
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                this._db.Tag.findOne({
                        where: {
                            id: req.params.tag_id
                        }
                    })
                    .then((data) => {
                        if (data.id) {
                            _.each(req.body.mongo_id, (val, key) => {
                                req.email.findOneAndUpdate({
                                    "_id": val
                                }, {
                                    "$pull": {
                                        "tag_id": req.params.tag_id
                                    }
                                }).exec((err) => {
                                    if (err) {
                                        next(new Error(err));
                                    } else {
                                        if (key == (_.size(req.body.mongo_id) - 1)) {
                                            res.json({
                                                status: 1,
                                                message: "success"
                                            });
                                        }
                                    }
                                });
                            });
                        } else {
                            next(new Error("invalid tag id"));
                        }
                    })
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    changeUnreadStatus = (req, res, next) => {
        let { mongo_id } = req.params;
        let status = (req.params.status + '').toLowerCase() === 'true'
        req.email.find({
            _id: mongo_id
        }, (err) => {
            if (err) {
                next(new Error(err));
            } else if (status == false) {
                req.email.update({
                    _id: mongo_id
                }, {
                    unread: status,
                }, (error) => {
                    if (error) {
                        next(new Error(err));
                    } else {
                        res.json({
                            status: 1,
                            message: "the unread status is successfully changed to " + req.params.status
                        });
                    }
                });
            } else {
                res.json({
                    status: 0,
                    message: "the unread status is not changed successfully,  you have to set status true or false"
                });
            }
        });
    }

    deleteEmail = (req, res) => {
        var response = [];
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                var size = _.size(req.body.mongo_id);
                _.forEach(req.body.mongo_id, (val, key) => {
                    req.email.findOneAndUpdate({
                        "_id": val
                    }, {
                        "$pull": {
                            "tag_id": req.params.tag_id
                        }
                    }, { new: true }).exec((err, data) => {
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
                        if (key == (size - 1)) {
                            res.json({ status: 1, message: "success", data: response });
                        }
                    });
                });
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    mailAttachment = (req, res, next) => {
        req.email.findOne({ _id: req.params.mongo_id }, (error, data) => {
            if (error) {
                next(new Error(error));
            } else {
                if (data) {
                    let to = data.get("imap_email");
                    let uid = data.get("uid");
                    if (to && uid) {
                        this._db.Imap.findOne({ where: { email: to } })
                            .then((data) => {
                                imap.imapCredential(data)
                                    .then((imap) => {
                                        Attachment.getAttachment(imap, uid)
                                            .then((response) => {
                                                req.email.findOneAndUpdate({ _id: req.params.mongo_id }, { $set: { attachment: response } }, { new: true }, (err, response) => {
                                                    if (err) {
                                                        res.json({ status: 0, message: err });
                                                    } else {
                                                        res.json({ status: 1, message: " attachment save successfully", data: response });
                                                    }
                                                });
                                            })
                                            .catch(this.handleErrorResponse.bind(null, res));
                                    })
                                    .catch(this.handleErrorResponse.bind(null, res));
                            })
                            .catch(this.handleErrorResponse.bind(null, res));
                    } else {
                        res.json({ status: 0, message: 'data not found in database' });
                    }
                } else {
                    res.json({ status: 0, message: 'mongo_id not found in database' });
                }
            }
        })
    }


    findByTagId = (req, res, next, tag_id) => {
        var where;
        let { type, keyword, selected, default_id } = req.body;
        this._db.Tag.findAll({ where: { type: "Default" } })
            .then((default_tag) => {
                var default_tag_id = []
                _.forEach(default_tag, (val, key) => {
                    default_tag_id.push(val.id.toString())
                })
                var where = '';
                if ((type == "email") && (!selected) && (!isNaN(tag_id) == false)) {

                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' } }
                } else if ((type == "subject") && (!selected) && (!isNaN(tag_id) == false)) {

                    where = { 'subject': { "$regex": keyword, '$options': 'i' } }
                } else if ((type == "email") && (selected == true) && (!isNaN(tag_id) == false)) {
                    if (default_id) {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id }
                    } else {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [] }
                    }
                } else if ((type == "subject") && (selected == true) && (!isNaN(tag_id) == false)) {
                    if (default_id) {
                        where = { 'subject': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id }
                    } else {
                        where = { 'subject': { "$regex": keyword, '$options': 'i' }, 'tag_id': [] }
                    }
                } else
                if ((type == "email") && tag_id) {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, "tag_id": { $in: [tag_id] } }
                    } else {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': { $in: [tag_id] } }
                    }
                } else if ((type == "subject") && tag_id) {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { "subject": { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': { $in: [tag_id] } }
                    } else {
                        where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': { $in: [tag_id] } }
                    }
                } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {

                    where = { tag_id: { $size: 0 } };
                } else {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { default_tag: default_id, tag_id: { $in: [tag_id] } }
                    } else if (default_tag_id.indexOf(tag_id) >= 0) {
                        where = { default_tag: tag_id }
                    } else {
                        where = { tag_id: { $in: [tag_id] } }
                    }
                }
                this.getCount(req, res, next, where)
            })
    }

    sendToMany = (req, res, next) => {
        var { emails, subject, body } = req.body;
        var email_send_success_list = [];
        var email_send_fail_list = [];
        var result = []
        db.Smtp.findOne({ where: { status: 1 } })
            .then((data) => {
                if (data) {
                    sendmail(data.email, function(response) {
                        res.json(response)
                    })
                } else {
                    throw new Error("No active smtp email found!!")
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));

        function sendmail(from, callback) {
            var to_email = emails.splice(0, 1);
            mail.sendMail(to_email[0], subject, "", from, body)
                .then((resp) => {
                    if (resp.status) {
                        email_send_success_list.push(to_email[0])
                    } else {
                        email_send_fail_list.push(to_email[0])
                    }
                    if (emails.length) {
                        sendmail(emails, callback)
                    } else {
                        callback({ data: [{ email_send_success_list: email_send_success_list, email_send_fail_list: email_send_fail_list, message: "mail sent successfully" }] })
                    }
                })
        }
    }

    sendToSelectedTag = (req, res, next) => {
        var email_send_success_list = [];
        var email_send_fail_list = [];
        var email_send_sucess_id = [];
        var id = req.body.tag_id
        this._db.Tag.findById(id)
            .then((data) => {
                this._db.Template.findById(data.template_id)
                    .then((template) => {
                        this._db.Smtp.findOne({ where: { status: 1 } })
                            .then((smtp) => {
                                req.email.find({ 'tag_id': { $in: [id] } }, { "_id": 1, "sender_mail": 1, "from": 1, "is_automatic_email_send": 1, "subject": 1 }).exec(function(err, result) {
                                    var emails = result;
                                    sendTemplateToEmails(emails, template, smtp, function(err, data) {
                                        if (err) {
                                            res.status(400).send({ message: err })
                                        } else {
                                            req.email.update({ "_id": { "$in": data.id } }, { is_automatic_email_send: 1 }, { multi: true })
                                                .then((data1) => {
                                                    console.log(data1)
                                                    delete data.id;
                                                    res.json(data)

                                                })
                                        }
                                    })

                                    function sendTemplateToEmails(emails, template, smtp, callback) {
                                        var subject = "";
                                        if (!smtp) {
                                            callback("Not active Smtp", null);
                                        }
                                        var email_id = emails.splice(0, 1)[0];
                                        replaceData.filter(template.body, emails.from, req.body.tag_id)
                                            .then((html) => {
                                                subject = constant().automatic_mail_subject + " " + template.subject;
                                                mail.sendMail(email_id.sender_mail, subject, constant().smtp.text, smtp.email, html)
                                                    .then((response) => {
                                                        if (response.status) {
                                                            email_send_sucess_id.push(email_id._id);
                                                            email_send_success_list.push(email_id.sender_mail)
                                                        } else {
                                                            email_send_fail_list.push(email_id.sender_mail)
                                                        }
                                                        if (emails.length) {
                                                            sendTemplateToEmails(emails, template, smtp, callback)
                                                        } else {
                                                            callback(null, { data: [{ email_send_success_list: email_send_success_list, email_send_fail_list: email_send_fail_list, message: "mail sent successfully" }], id: email_send_sucess_id })
                                                        }
                                                    })

                                            })

                                    }
                                })
                            })
                    })
            })
    }
    fetchByButton = (req, res, next) => {
        inbox.fetchEmail(req.email, 'apiCall')
            .then((data) => {
                res.json({ status: 1, message: "success" });
            });
    }
}

const controller = new FetchController();
export default controller;
