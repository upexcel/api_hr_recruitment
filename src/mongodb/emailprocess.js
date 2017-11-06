import * as _ from "lodash";
import db from "../db";
import constant from "../models/constant";
import mail from "../modules/mail";
import replaceData from "../modules/replaceVariable";
import imap from "../service/imap";
import Attachment from "../modules/getAttachment";
import moment from 'moment';
import pushMessage from '../service/pushmessage';
import crypto from "crypto";
import logs from "../service/emaillogs";
import slack from '../service/sendSlackNotification';

const fetchEmail = (page, tag_id, limit, type, keyword, selected, default_id, default_tag, db, is_attach) => {
    return new Promise((resolve, reject) => {
        let message;
        let default_tag_id = []
        _.forEach(default_tag, (val, key) => {
            default_tag_id.push(val.id.toString())
        })
        let where = '';
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
                if (!is_attach) {
                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [] }
                } else {
                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true }
                }
            }
        } else if ((type == "subject") && (selected == true) && (!isNaN(tag_id) == false)) {
            if (default_id) {
                where = { 'subject': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id }
            } else {
                if (!is_attach) {
                    where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [] }
                } else {
                    where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true }
                }
            }
        } else
        if ((type == "email") && tag_id) {
            if (default_tag_id.indexOf(default_id) >= 0) {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id }
            } else {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" }
            }
        } else if ((type == "subject") && tag_id) {
            if (default_tag_id.indexOf(default_id) >= 0) {
                where = { "subject": { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id }
            } else {
                where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" }
            }
        } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {
            if (!is_attach) {
                where = { tag_id: { $size: 0 }, is_attachment: 0 };
            } else {
                where = { tag_id: { $size: 0 }, is_attachment: 1 };
            }
        } else {
            if (default_tag_id.indexOf(default_id) >= 0) {
                where = { default_tag: default_id, tag_id: { $in: [tag_id] } }
            } else if (default_tag_id.indexOf(tag_id) >= 0) {
                where = { default_tag: tag_id }
            } else {
                where = { tag_id: { $in: [tag_id] }, default_tag: "" }
            }
        }
        db.find(where, { "_id": 1, "date": 1, "email_date": 1, "is_automatic_email_send": 1, "from": 1, "sender_mail": 1, "subject": 1, "unread": 1, "attachment": 1, "tag_id": 1, "is_attachment": 1, "default_tag": 1, "mobile_no": 1 }, { sort: { date: -1 } }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec((err, data) => {
            if (err) {
                console.log(err)
                reject(err);
            } else {
                resolve(data, message);
            }
        });
    })
}


const findcount = (mongodb) => {
    return new Promise((resolve, reject) => {
        let count1 = [];
        let tagId = [];
        let mails_unread_count = 0;
        let mails_total_count = 0;
        let sub_child_list = [];
        let candidate_list = [];
        let final_data = [];
        db.Tag.findAll({ where: { type: constant().tagType.automatic, is_job_profile_tag: 0 } })
            .then((tags) => {
                _.forEach(tags, (val, key) => {
                    tagId.push(val)
                })
                db.Tag.findAll({
                        where: { type: constant().tagType.automatic, is_job_profile_tag: 1 },
                        order: '`priority` ASC'
                    })
                    .then((candidate) => {
                        _.forEach(candidate, (val, key) => {
                            candidate_list.push(val)
                        })
                        mongodb.find({ tag_id: [], is_attachment: false }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
                            mails_total_count = result.length;
                            _.forEach(result, (val, key) => {
                                if (val.unread === true) {
                                    mails_unread_count++;
                                }
                            })
                            findCount(tagId, function(data) {
                                findAttachmentMailsCount(function(attachment_count) {
                                    data.push(attachment_count)
                                    count1 = []
                                    let mails = { title: "Mails", id: 0, unread: mails_unread_count, count: mails_total_count, type: constant().tagType.automatic }
                                    data.push(mails)
                                    let default_id1 = [];
                                    _.forEach(data, (val, key) => {
                                        delete val.subchild
                                        final_data.push(val)
                                    })
                                    db.Tag.findAll({ where: { type: constant().tagType.default } })
                                        .then((default_tag) => {
                                            _.forEach(default_tag, (val, key) => {
                                                if (val.title != constant().tagType.genuine) {
                                                    default_id1.push(val);
                                                }
                                            })
                                            findCount(candidate_list, function(data1) {
                                                let array = [{ title: "candidate", data: data1 }, { title: "inbox", data: final_data }]
                                                resolve({ data: array })
                                            })
                                        })
                                })
                            })
                        })
                    })
            })

        function findAttachmentMailsCount(callback) {
            mongodb.find({ tag_id: [], is_attachment: true }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
                let attachment_mail_total_count = result.length;
                let attachment_mail_unread_count = 0;
                if (attachment_mail_total_count) {
                    _.forEach(result, (val, key) => {
                        if (val.unread === true) {
                            attachment_mail_unread_count++;
                        }
                        if (key == result.length - 1) {
                            callback({ title: "Attachment", id: null, unread: attachment_mail_unread_count, count: attachment_mail_total_count, type: constant().tagType.automatic })
                        }
                    })
                } else {
                    callback({ title: "Attachment", id: null, unread: attachment_mail_unread_count, count: attachment_mail_total_count, type: constant().tagType.automatic })
                }
            })
        }

        function findDefaultCount(default_tag_id, callback) {
            if (default_tag_id.length == 0) {
                callback(final_data)
            } else {
                let id1 = default_tag_id.splice(0, 1)[0];
                mongodb.find({ default_tag: id1.id }).exec(function(err, result1) {
                    let unread = 0;
                    _.forEach(result1, (val, key) => {
                        if (val.unread === true) {
                            unread++;
                        }
                    })
                    let default_tag_data = {
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
                let tagId = tag_id.splice(0, 1)[0]
                mongodb.find({ tag_id: { "$in": [tagId.id.toString()] }, default_tag: "" }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
                    let unread = 0
                    _.forEach(result, (val, key) => {
                        if (val.unread === true) {
                            unread++;
                        }
                    })
                    sub_child_list = []
                    db.Tag.findAll({ where: { type: constant().tagType.default }, order: '`default_id` ASC' })
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
            let default_tag_id = default_tag_list.splice(0, 1)[0]
            mongodb.find({ tag_id: { "$in": [tagId.id.toString()] }, default_tag: default_tag_id.id }).exec(function(err, default_tag_mail) {
                let child = {
                    id: default_tag_id.id,
                    color: default_tag_id.color,
                    title: default_tag_id.title,
                    count: 0,
                    unread: 0,
                    parent_id: default_tag_id.parent_id
                }
                if (default_tag_mail.length) {
                    child.count = default_tag_mail.length
                    let unread = 0
                    _.forEach(default_tag_mail, (val, key) => {
                        if (val.unread === true) {
                            unread++;
                        }
                    })
                    child.unread = unread
                }
                if (child.parent_id != tagId.id && child.parent_id != null) {
                    // sub_child_list.push(child)
                } else {
                    sub_child_list.push(child)
                }
                if (default_tag_list.length) {
                    find_child_count(tagId, default_tag_list, callback)
                } else {
                    let tagData = {
                        subchild: sub_child_list
                    }
                    callback(tagData)
                }

            })
        }
    })
}

let assignMultiple = (tag_id, body, email) => {
    return new Promise((resolve, reject) => {
        let where;
        db.Tag.findOne({
                where: {
                    id: tag_id
                }
            })
            .then((data) => {
                if (data.id) {
                    if (data.type == constant().tagType.default && body.shedule_for) {
                        if (body.shedule_for == constant().shedule_for[0].value) {
                            var registration_id = Math.floor((Math.random() * 1000 * 1000) + Math.random() * 10000);
                            where = { "default_tag": tag_id.toString(), "shedule_for": body.shedule_for, "shedule_date": body.shedule_date, "shedule_time": body.shedule_time, "registration_id": registration_id, mobile_no: body.mobile_no, updated_time: new Date(), send_template: body.tamplate_id }
                        } else {
                            where = { "default_tag": tag_id.toString(), "shedule_for": body.shedule_for, "shedule_date": body.shedule_date, "shedule_time": body.shedule_time, mobile_no: body.mobile_no, updated_time: new Date(), send_template: body.tamplate_id }
                        }
                    } else if (data.type == constant().tagType.default) {
                        where = { "default_tag": tag_id.toString(), "shedule_for": "", "shedule_date": "", "shedule_time": "", updated_time: new Date() };
                    } else {
                        where = { "$addToSet": { "tag_id": tag_id.toString() }, updated_time: new Date() };
                    }
                    email.update({ "_id": { "$in": body.mongo_id } }, where, { multi: true }).exec((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (data.type == constant().tagType.default && body.shedule_for) {
                                email.findOne({ "_id": { "$in": body.mongo_id } }, { "attachment": 1, "sender_mail": 1, "default_tag": 1, "from": 1, "tag_id": 1, "registration_id": 1, "from": 1 }).exec(function(err, response) {
                                    db.Template.findById(body.tamplate_id)
                                        .then((template) => {
                                            replaceData.schedule_filter(template.body, response.from, response.tag_id[response.tag_id.length - 1], body.scheduled_date, body.scheduled_time)
                                                .then((replaced_data) => {
                                                    if (body.shedule_for == constant().shedule_for[0].value)
                                                        replaced_data = replaced_data + constant().registration_message + registration_id
                                                    db.Smtp.findOne({ where: { status: 1 } })
                                                        .then((smtp) => {
                                                            if (!smtp) {
                                                                resolve({
                                                                    status: 1,
                                                                    message: "Interview is sheduled but email is not send",
                                                                    data: response
                                                                })
                                                            }
                                                            template.subject += " On Dated " + body.shedule_date + " At " + body.shedule_time;
                                                            let custom_link = constant().app_custom_link + response.registration_id || registration_id;
                                                            replaced_data += custom_link;
                                                            mail.sendScheduledMail(response.sender_mail, template.subject, "", smtp, replaced_data)
                                                                .then((mail_response) => {
                                                                    db.Tag.findById(parseInt(response.tag_id[0])).then((tag_info) => {
                                                                        let link = response.attachment[0] ? response.attachment[0].link : "No Attachment";
                                                                        let slack_message = constant().slack_message + "\n" + "Job Profile: " + tag_info.title + "\n" + "Candidate Name: " + response.from + "\n" + " On Dated " + body.shedule_date + " At " + body.shedule_time + "\n" + "Cv: " + link;
                                                                        slack.slackNotification(slack_message, response.sender_mail).then((response) => {
                                                                            db.Candidate_device.findOne({ where: { email_id: response.sender_mail } })
                                                                                .then((device_list) => {
                                                                                    if (device_list) {
                                                                                        let push_message = "";
                                                                                        _.forEach(constant().shedule_for, (val, key) => {
                                                                                            if (val.value == body.shedule_for) {
                                                                                                push_message = val.text + " on " + moment(body.shedule_date).format("MMM DD, YYYY") + " at " + body.shedule_time;
                                                                                            }
                                                                                        })
                                                                                        pushMessage.pushMessage(device_list, push_message)
                                                                                            .then((push_response) => {
                                                                                                if (!push_response.error) {
                                                                                                    email.update({ "_id": { "$in": body.mongo_id } }, { "$addToSet": { "push_message": constant().push_notification_message + " " + body.shedule_for }, "push_status": 1 }, { multi: true }).exec(function(err, saved_info) {
                                                                                                        resolve({
                                                                                                            status: 1,
                                                                                                            message: "success",
                                                                                                            data: response,
                                                                                                            push_status: push_response,
                                                                                                            email_status: mail_response
                                                                                                        });
                                                                                                    })
                                                                                                } else {
                                                                                                    resolve({
                                                                                                        status: 1,
                                                                                                        message: "success",
                                                                                                        data: response,
                                                                                                        push_status: push_response,
                                                                                                        email_status: mail_response
                                                                                                    });
                                                                                                }
                                                                                            })
                                                                                    } else {
                                                                                        resolve({
                                                                                            status: 1,
                                                                                            message: "success",
                                                                                            data: response,
                                                                                            email_status: mail_response
                                                                                        })
                                                                                    }
                                                                                }, (err) => { reject(err) })

                                                                        }, (err) => { reject(err) })
                                                                    })
                                                                })
                                                        })
                                                })

                                        })
                                })
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
            })
    })
}

let fetchById = (type, keyword, selected, default_id, tag_id, is_attach) => {
    return new Promise((resolve, reject) => {
        db.Tag.findAll({ where: { type: constant().tagType.default } })
            .then((default_tag) => {
                let default_tag_id = []
                _.forEach(default_tag, (val, key) => {
                    default_tag_id.push(val.id.toString())
                })
                let where = ""
                if ((type == "email") && (!selected) && (!isNaN(tag_id) == false)) {

                    where = { 'sender_mail': { "$regex": keyword, '$options': 'i' } }
                } else if ((type == "subject") && (!selected) && (!isNaN(tag_id) == false)) {

                    where = { 'subject': { "$regex": keyword, '$options': 'i' } }
                } else if ((type == "email") && (selected == true) && ((!isNaN(tag_id) == false))) {
                    if (default_id) {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id }
                    } else {
                        if (!is_attach) {
                            where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [] }
                        } else {
                            where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true }
                        }
                    }
                } else if ((type == "subject") && (selected == true) && (!isNaN(tag_id) == false)) {
                    if (default_id) {
                        where = { 'subject': { "$regex": keyword, '$options': 'i' }, "default_tag": default_id }
                    } else {
                        if (!is_attach) {
                            where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [] }
                        } else {
                            where = { 'subject': { "$regex": keyword, '$options': 'i' }, "tag_id": [], is_attachment: true }
                        }
                    }
                } else
                if ((type == "email") && tag_id) {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id }
                    } else {
                        where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" }
                    }
                } else if ((type == "subject") && tag_id) {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { "subject": { "$regex": keyword, '$options': 'i' }, 'default_tag': default_id, 'tag_id': tag_id }
                    } else {
                        where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id, default_tag: "" }
                    }
                } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {
                    if (!is_attach) {
                        where = { tag_id: { $size: 0 }, is_attachment: 0 };
                    } else {
                        where = { tag_id: { $size: 0 }, is_attachment: 1 };
                    }
                } else {
                    if (default_tag_id.indexOf(default_id) >= 0) {
                        where = { default_tag: default_id, tag_id: { $in: [tag_id] } }
                    } else if (default_tag_id.indexOf(tag_id) >= 0) {
                        where = { default_tag: tag_id }
                    } else {
                        where = { tag_id: { $in: [tag_id] }, default_tag: "" }
                    }
                }
                resolve(where)
            })
    })
}

let sendToMany = (req, email_list, subject, body, tag_id, default_id, email) => {
    return new Promise((resolve, reject) => {
        let where;
        let emails = [];
        if (tag_id && default_id) {
            where = { "tag_id": { "$in": [tag_id.toString()] }, "default_tag": default_id.toString() };
        } else {
            where = { tag_id: { "$in": [tag_id.toString()] }, "default_tag": "" };
        }
        if (tag_id) {
            email.find({ "$and": [where] }).exec(function(err, data) {
                _.forEach(data, (val, key) => {
                    emails.push(val.sender_mail)
                    if (key == data.length - 1) {
                        let data = new req.cronWork({ body: req.body.body, tag_id: tag_id.toString(), subject: req.body.subject, user: req.user.email, candidate_list: emails, status: 1, work: constant().sendToAll, template_id: req.body.template_id })
                        data.save(function(err, response) {
                            resolve(response)
                        })
                    }
                })
            })
        }
    })
}

let sendToSelectedTag = (req, id, email) => {
    return new Promise((resolve, reject) => {
        let email_send_success_list = [];
        let email_send_fail_list = [];
        db.Tag.findById(id)
            .then((data) => {
                if (data) {
                    db.Template.findById(data.template_id)
                        .then((template) => {
                            if (template) {
                                email.find({ 'tag_id': { $in: [id.toString()] }, "$or": [{ is_automatic_email_send: 0 }, { is_automatic_email_send: { "$exists": false } }] }, { "_id": 1, "sender_mail": 1, "from": 1, "subject": 1, "tag_id": 1 }).exec(function(err, result) {
                                    let data = new req.cronWork({ tag_id: id.toString(), candidate_list: result, template_id: template.id, user: req.user.email, work: constant().pending_work, status: 1 });
                                    data.save(function(err, response) {
                                        if (err) {
                                            reject(err)
                                        } else {
                                            resolve({ status: 0, message: "Send email to pending candidate is started..", data: [] });
                                        }
                                    })
                                })
                            } else {
                                reject("No template found")
                            }
                        })
                } else {
                    reject("Invalid Tag id")
                }
            })
    })
}

let mailAttachment = (mongo_id, email) => {
    return new Promise((resolve, reject) => {
        email.findOne({ _id: mongo_id }, (error, data) => {
            if (error) {
                reject(error)
            } else {
                if (data) {
                    let to = data.get("imap_email");
                    let uid = data.get("uid");
                    if (to && uid) {
                        db.Imap.findOne({ where: { email: to } })
                            .then((data) => {
                                imap.imapCredential(data)
                                    .then((imap) => {
                                        Attachment.getAttachment(imap, uid)
                                            .then((response) => {
                                                email.findOneAndUpdate({ _id: mongo_id }, { $set: { attachment: response } }, { new: true }, (err, response) => {
                                                    if (err) {
                                                        resolve({ status: 0, message: err });
                                                    } else {
                                                        resolve({ status: 1, message: " attachment save successfully", data: response });
                                                    }
                                                });
                                            })

                                    })

                            })

                    } else {
                        resolve({ status: 0, message: 'data not found in database' });
                    }
                } else {
                    resolve({ status: 0, message: 'mongo_id not found in database' });
                }
            }
        })
    })
}

let deleteEmail = (tag_id, mongo_id, email) => {
    return new Promise((resolve, reject) => {
        let response = [];
        let size = _.size(mongo_id);
        _.forEach(mongo_id, (val, key) => {
            email.findOneAndUpdate({ "_id": val }, { "$pull": { "tag_id": tag_id } }, { new: true }).exec((err, data) => {
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
                if (key == (mongo_id.length - 1)) {
                    resolve({ status: 1, message: "success", data: response });
                }
            });
        });
    })
}

let deleteTag = (tag_id, mongo_id, email) => {
    return new Promise((resolve, reject) => {
        db.Tag.findOne({ where: { id: tag_id } })
            .then((data) => {
                if (data.id) {
                    _.each(mongo_id, (val, key) => {
                        email.findOneAndUpdate({ "_id": val }, { "$pull": { "tag_id": tag_id } }).exec((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                if (key == (_.size(mongo_id) - 1)) {
                                    resolve({ status: 1, message: "success" });
                                }
                            }
                        });
                    });
                } else {
                    reject("invalid tag id");
                }
            })
    })
}

let getShedule = (email) => {
    return new Promise((resolve, reject) => {
        let slots_array = [];
        let list_array = [];
        let final_data_list = {}
        let lastDate = moment(new Date()).add(1, 'months');
        let rounds = []
        getDates(moment(new Date()).add(1, 'days'), lastDate, function(dateArray) {
            _.forEach(constant().shedule_for, (val, key) => {
                rounds.push({ round: val.text });
                if (key == constant().shedule_for.length - 1) {
                    dateArray[0]['rounds'] = rounds
                    resolve(dateArray)
                }
            })
        })

        function getDates(startDate, stopDate, callback) {
            let week_of_month = [1, 2, 3, 4, 5]
            let currentDate = moment(startDate);
            stopDate = moment(stopDate);
            if (!(moment(currentDate).day() == 6 && !(week_of_month[0 | moment(currentDate).date() / 7] % 2))) {
                if (!moment(currentDate).day() == 0) {
                    getTimeSlots(currentDate, function(time_slots) {
                        currentDate = moment(currentDate).add(1, 'days');
                        if (startDate <= stopDate) {
                            getDates(currentDate, stopDate, callback)
                        } else {
                            callback(time_slots);
                        }
                    })
                } else {
                    currentDate = moment(currentDate).add(1, 'days');
                    getDates(currentDate, stopDate, callback)
                }
            } else {
                currentDate = moment(currentDate).add(1, 'days');
                getDates(currentDate, stopDate, callback)
            }
        }

        function getTimeSlots(currentDate, callback) {
            slots_array = []
            final_data_list = {}
            let shedule_for = constant().shedule_for;
            let shedule_time_slots = [constant().first_round_slots, constant().second_round_slots, constant().third_round_slots];
            check_slot_status(shedule_for, shedule_time_slots, currentDate, function(response) {
                list_array.push({ date: currentDate.toISOString().substring(0, 10), time_slots: response })
                callback(list_array)
            })

        }


        function check_slot_status(shedule_type, shedule_slots, date, callback) {
            let shedule = shedule_type.splice(0, 1)[0]
            let slots = shedule_slots.splice(0, 1)[0]
            email.find({ shedule_date: date.toISOString().substring(0, 10), shedule_for: shedule.value }, { "shedule_time": 1 }).exec(function(err, shedule_time) {
                if (shedule_time.length) {
                    let time = []
                    _.forEach(shedule_time, (val, key) => {
                        time.push(val.shedule_time)
                    })
                    _.forEach(slots, (val, key) => {
                        if (time.indexOf(val) >= 0) {
                            slots_array.push({ time: time[time.indexOf(val)], status: 0 })
                        } else {
                            slots_array.push({ time: val, status: 1 })
                        }
                        if (key == slots.length - 1) {
                            final_data_list[shedule.value] = slots_array;
                            if (shedule_type.length) {
                                slots_array = []
                                check_slot_status(shedule_type, shedule_slots, date, callback)
                            } else {
                                final_data_list[shedule.value] = slots_array;
                                callback(final_data_list)
                            }
                        }
                    })
                } else {
                    _.forEach(slots, (val, key) => {
                        slots_array.push({ time: val, status: 1 })
                        if (key == slots.length - 1) {
                            final_data_list[shedule.value] = slots_array;
                            if (shedule_type.length) {
                                slots_array = []
                                check_slot_status(shedule_type, shedule_slots, date, callback)
                            } else {
                                final_data_list[shedule.value] = slots_array;
                                callback(final_data_list)
                            }
                        }
                    })
                }
            })

        }
    });
}

let assignToOldTag = (data, email) => {
    return new Promise((resolve, reject) => {
        db.Tag.assignTag(data, email)
            .then((response) => {
                function assignTag(id) {
                    let mongoId = id.splice(0, 100)
                    email.update({ _id: { $in: mongoId } }, { "$addToSet": { "tag_id": data.id.toString() }, "email_timestamp": new Date().getTime() }, { multi: true })
                        .then((data1) => {
                            if (!id.length) {
                                resolve({ message: "tag assigned sucessfully" })
                            } else {
                                assignTag(id)
                            }
                        })
                }
                assignTag(response)
            }, (err) => {
                reject(err)
            });
    })
}

let assignToNewTag = (data, email) => {
    return new Promise((resolve, reject) => {
        db.Tag.assignNewTag(data, email)
            .then((response) => {
                function assignTag(id) {
                    let mongoId = id.splice(0, 100)
                    email.update({ _id: { $in: mongoId } }, { "default_tag": data.id.toString(), "email_timestamp": new Date().getTime() }, { multi: true })
                        .then((data1) => {
                            if (!id.length) {
                                resolve({ message: "tag assigned sucessfully" })
                            } else {
                                assignTag(id)
                            }
                        })
                }
                assignTag(response)
            }, (err) => {
                reject(err)
            });
    })
}

let getFetchedMailCount = (imap_emails, email) => {
    return new Promise((resolve, reject) => {
        let result = []
        findCount(imap_emails, function(data) {
            resolve(result)
        })

        function findCount(emails, callback) {
            let imap_data = "";
            let imap_email = emails.splice(0, 1)[0]
            if (!imap_email) {
                callback({})
            } else {
                email.find({ imap_email: imap_email.email }).count().exec(function(err, data) {
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
                        fetched_mail_till: moment(imap_email.last_fetched_time).format("DD,MM,YYYY"),
                        total_emails: imap_email.total_emails,
                        days_left_to_fetched: imap_email.days_left_to_fetched
                    }
                    result.push(imap_data)
                    if (emails.length) {
                        findCount(emails, callback)
                    } else {
                        callback(result)
                    }
                })
            }
        }
    })
}

let app_get_candidate = (email, registration_id) => {
    return new Promise((resolve, reject) => {
        let rounds = []
        let scheduled_rounds = []
        _.forEach(constant().shedule_for, (val, key) => {
            scheduled_rounds.push(val.value)
        })
        email.findOne({ shedule_for: { "$in": scheduled_rounds }, registration_id: registration_id }, { "from": 1, "tag_id": 1, "shedule_date": 1, "shedule_time": 1, "shedule_for": 1, "push_message": 1, "push_status": 1, "registration_id": 1, "sender_mail": 1, "mobile_no": 1 }).exec(function(err, response) {
            if (err) {
                reject({ error: 1, message: "Invalid Registration Number", data: [] })
            } else {
                if (response) {
                    _.each(constant().shedule_for, (val, key) => {
                        rounds.push((val.value == response.shedule_for) ? { text: val.text, info: val.info, scheduled_time: response.shedule_time, scheduled_date: moment(response.shedule_date).format("MMM DD, YYYY"), status: 1 } : { text: val.text, info: val.info, scheduled_time: "", scheduled_date: "", status: 0 })
                        if (key == constant().shedule_for.length - 1 || (val.value == response.shedule_for)) {
                            db.Tag.findTagInfo(response.tag_id[0])
                                .then((tagInfo) => {
                                    resolve({ name: response.from, mobile_no: response.mobile_no || null, email: response.sender_mail, subject: tagInfo.subject, job_description: tagInfo.job_description, rounds: rounds, push_message: response.push_message, push_status: response.push_status, registration_id: response.registration_id, office_location: constant().office_location, app_hr_contact_email: constant().app_hr_contact_email, app_hr_contact_number: constant().app_hr_contact_number, job_title: tagInfo.title })
                                }, (error) => { reject(error) })
                            return false
                        }
                    })
                } else {
                    reject({ error: 1, message: "Invalid Registration Number", data: [] })
                }
            }
        })
    })
}

let checkEmailStatus = (req) => {
    return new Promise((resolve, reject) => {
        let rounds = [];
        let flag = 0
        _.forEach(constant().shedule_for, (val, key) => {
            rounds.push(val.value)
        })
        req.email.findOne({ sender_mail: req.body.email, tag_id: req.body.tag_id.toString(), shedule_for: { $in: rounds } }, { "shedule_for": 1 }).exec(function(err, email_data) {
            if (err) {
                reject(err)
            } else if (!email_data) {
                flag++
            } else if (email_data._id == req.body.mongo_id) {
                flag++
            }
            resolve({ flag: flag, message: flag ? "" : "Candidate is Already Scheduled" })
        })
    })
}

let findEmailByDates = (days) => {
    return new Promise((resolve, reject) => {
        db.Imap.update({ fetched_date_till: new Date(), days_left_to_fetched: days }, { where: { active: 1 } }).then((data) => {
            resolve(data)
        }).catch((err) => {
            reject(err)
        })
    })
}

let sendToNotReplied = (req) => {
    return new Promise((resolve, reject) => {
        let sender_mail_array = []
        db.Tag.findOne({ where: { title: constant().tagType.genuine } }).then((default_tag) => {
            req.email.find({ tag_id: req.body.tag_id, default_tag: default_tag.id.toString() }, { sender_mail: 1 }).then((sender_mail_data) => {
                _.forEach(sender_mail_data, (val, key) => {
                    sender_mail_array.push(val.sender_mail)
                    if (key == sender_mail_data.length - 1) {
                        req.email.find({ tag_id: req.body.tag_id.toString(), sender_mail: { $not: { $in: sender_mail_array } }, default_tag: "", "$or": [{ send_template_count: { "$exists": false } }, { send_template_count: { $lte: 3 } }], template_id: { $ne: parseInt(req.body.template_id) } }, { sender_mail: 1, from: 1 }).then((candidate_list) => {
                            let data = new req.cronWork({ body: req.body.body, subject: req.body.subject, user: req.user.email, tag_id: req.body.tag_id, default_tag: req.body.default_tag, candidate_list: candidate_list, status: 1, work: constant().not_replied, template_id: req.body.template_id })
                            data.save(function(err, response) {
                                resolve({ no_of_candidate: candidate_list.length, message: "CronWork Is Started..." })
                            })
                        })
                    }
                })
            })
        })
    });
}

let sendBySelection = (req) => {
    return new Promise((resolve, reject) => {
        let sender_mail_array = []
        let data = new req.cronWork({ body: req.body.body, subject: req.body.subject, user: req.user.email, candidate_list: req.body.emails, status: 1, work: constant().selectedCandidate, template_id: req.body.template_id })
        data.save(function(err, response) {
            resolve({ no_of_candidate: req.body.emails.length, message: "CronWork Is Started..." })
        })
    })
}

let insert_note = (req) => {
    return new Promise((resolve, reject) => {
        req.email.update({ "_id": req.body.mongo_id }, { "$push": { "notes": { $each: [{ note: req.body.note, date: moment(new Date()).format("DD-MM-YYYY"), time: moment(new Date()).format("hh:mm:ss a"), assignee: req.user.email }] } } }).exec(function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve({ error: 0, message: "Note inserted", response: result })
            }
        })
    })
}

let update_note = (req) => {
    return new Promise((resolve, reject) => {
        req.email.update({ "_id": req.body.mongo_id, "notes.date": req.body.note_date, "notes.time": req.body.note_time }, { $set: { "notes.$.note": req.body.note, "notes.$.date": moment(new Date()).format("DD-MM-YYYY"), "notes.$.time": moment(new Date()).format("hh:mm:ss a") } }).exec(function(err, result) {
            if (err) {
                reject(err)
            } else {
                if (result.nModified) {
                    resolve({ error: 0, message: "Note updated" })
                } else {
                    resolve({ error: 0, message: "Note not found" })
                }
            }
        })
    })
}

let cron_status = (req) => {
    return new Promise((resolve, reject) => {
        findCronStatus(req.body, function(response) {
            resolve(response)
        })
    })

    function findCronStatus(data, callback) {
        findPendingCandidate(data, function(pending_candidate_status) {
            sendToAll(data, function(send_to_all_status) {
                notRepliedCandidate(data, function(notRepliedCandidate) {
                    let response = {
                        pending_candidate_status: pending_candidate_status,
                        send_to_all_status: send_to_all_status,
                        notRepliedCandidate: notRepliedCandidate
                    }
                    callback(response)
                })
            })
        })
    }

    function findPendingCandidate(data, callback) {
        req.cronWork.find({ status: 1, work: constant().pending_work, tag_id: data.tag_id.toString }).then((pending_candidate) => {
            let count = 0;
            if (pending_candidate.length) {
                _.forEach(pending_candidate, (val, key) => {
                    count += val.get('candidate_list').length;
                    if (key == pending_candidate.length - 1) {
                        callback(count)
                    }
                })
            } else {
                callback(count)
            }
        })
    }

    function sendToAll(data, callback) {
        req.cronWork.find({ status: 1, work: constant().sendToAll, tag_id: data.tag_id.toString }).then((pending_candidate) => {
            let count = 0;
            if (pending_candidate.length) {
                let count = 0;
                _.forEach(pending_candidate, (val, key) => {
                    count += val.get('candidate_list').length;
                    if (key == pending_candidate.length - 1) {
                        callback(count)
                    }
                })
            } else {
                callback(count)
            }
        })
    }

    function notRepliedCandidate(data, callback) {
        req.cronWork.find({ status: 1, work: constant().not_replied, tag_id: data.tag_id.toString }).then((pending_candidate) => {
            let count = 0;
            if (pending_candidate.length) {
                _.forEach(pending_candidate, (val, key) => {
                    count += val.get('candidate_list').length;
                    if (key == pending_candidate.length - 1) {
                        callback(count)
                    }
                })
            } else {
                callback(count)
            }
        })
    }
}

let archiveEmails = (body, source, target) => {
    return new Promise((resolve, reject) => {
        source.find({ tag_id: body.tag_id }).then((mails) => {
            target.insertMany(mails).then((write_reponse) => {
                source.remove({ tag_id: body.tag_id || [] }).then((response) => {
                    resolve({ status: 1, message: "All Emails are moved to Archived" })
                })
            })
        })
    })
}


export default {
    fetchEmail,
    findcount,
    assignMultiple,
    fetchById,
    sendToMany,
    sendToSelectedTag,
    mailAttachment,
    deleteEmail,
    deleteTag,
    getShedule,
    assignToOldTag,
    assignToNewTag,
    getFetchedMailCount,
    app_get_candidate,
    checkEmailStatus,
    findEmailByDates,
    sendToNotReplied,
    sendBySelection,
    insert_note,
    update_note,
    cron_status,
    archiveEmails
}