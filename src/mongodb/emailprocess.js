import * as _ from "lodash";
import db from "../db";
import constant from "../models/constant";
import mail from "../modules/mail";
import replaceData from "../modules/replaceVariable";
import imap from "../service/imap";
import Attachment from "../modules/getAttachment";
import moment from 'moment';
import pushMessage from '../service/pushmessage';

const fetchEmail = (page, tag_id, limit, type, keyword, selected, default_id, default_tag, db) => {
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
        db.find(where, { "_id": 1, "date": 1, "email_date": 1, "is_automatic_email_send": 1, "from": 1, "sender_mail": 1, "subject": 1, "unread": 1, "attachment": 1, "tag_id": 1, "is_attachment": 1, "default_tag": 1 }).sort({ date: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec((err, data) => {
            if (err) {
                reject(err);
            } else {
                if (data[0] == null) {
                    message = "No Result Found"
                }
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
                db.Tag.findAll({ where: { type: constant().tagType.automatic, is_job_profile_tag: 1 } })
                    .then((candidate) => {
                        _.forEach(candidate, (val, key) => {
                            candidate_list.push(val)
                        })
                        mongodb.find({ tag_id: [] }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
                            mails_total_count = result.length;
                            _.forEach(result, (val, key) => {
                                if (val.unread === true) {
                                    mails_unread_count++;
                                }
                            })
                            findCount(tagId, function(data) {
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
                                            let array = [{ title: "candidate", data: data1 }, { title: "inbox", data: final_data }, { subject_for_genuine: constant().automatic_mail_subject }]
                                            resolve({ data: array })
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
                mongodb.find({ tag_id: { "$in": [tagId.id.toString()] } }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
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
                    unread: 0
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
                // if (child.title != constant().tagType.genuine) {
                //     sub_child_list.push(child)
                // }
                sub_child_list.push(child)
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
                        where = { "default_tag": tag_id.toString(), "email_timestamp": new Date().getTime(), "shedule_for": body.shedule_for, "shedule_date": body.shedule_date, "shedule_time": body.shedule_time }
                    } else if (data.type == constant().tagType.default) {
                        where = { "default_tag": tag_id.toString(), "email_timestamp": new Date().getTime(), "shedule_for": "", "shedule_date": "", "shedule_time": "" };
                    } else {
                        where = { "$addToSet": { "tag_id": tag_id }, "email_timestamp": new Date().getTime() };
                    }
                    email.update({ "_id": { "$in": body.mongo_id } }, where, { multi: true }).exec((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (data.type == constant().tagType.default && body.shedule_for) {
                                email.findOne({ "_id": { "$in": body.mongo_id } }, { "sender_mail": 1, "default_tag": 1, "from": 1, "tag_id": 1 }).exec(function(err, response) {
                                    db.Template.findById(body.tamplate_id)
                                        .then((template) => {
                                            replaceData.filter(template.body, response.from, response.tag_id[response.tag_id.length - 1])
                                                .then((replaced_data) => {
                                                    db.Smtp.findOne({ where: { status: 1 } })
                                                        .then((smtp) => {
                                                            if (!smtp) {
                                                                resolve({
                                                                    status: 1,
                                                                    message: "Interview is sheduled but email is not send",
                                                                    data: response
                                                                })
                                                            }
                                                            mail.sendMail(response.sender_mail, template.subject, "", smtp.email, replaced_data)
                                                                .then((mail_response) => {
                                                                    db.Candidate_device.findOne({ where: { email_id: response.sender_mail } })
                                                                        .then((device_list) => {
                                                                            if (device_list) {
                                                                                pushMessage.pushMessage(device_list, body.shedule_for)
                                                                                    .then((push_response) => {
                                                                                        if (!push_response.error) {
                                                                                            email.update({ "_id": { "$in": body.mongo_id } }, { "$addToSet": { "push_message": constant().push_notification_message + " " + body.shedule_for }, "push_status": 1 }, { multi: true }).exec(function(err, saved_info) {
                                                                                                resolve({
                                                                                                    status: 1,
                                                                                                    message: "success",
                                                                                                    data: response,
                                                                                                    push_status: push_response
                                                                                                });
                                                                                            })
                                                                                        } else {
                                                                                            resolve({
                                                                                                status: 1,
                                                                                                message: "success",
                                                                                                data: response,
                                                                                                push_status: push_response
                                                                                            });
                                                                                        }
                                                                                    })
                                                                            } else {
                                                                                resolve({
                                                                                    status: 1,
                                                                                    message: "success",
                                                                                    data: response
                                                                                })
                                                                            }
                                                                        }, (err) => { reject(err) })

                                                                }, (err) => { reject(err) })
                                                        })
                                                })

                                        })
                                })
                            } else {
                                resolve({
                                    status: 1,
                                    message: "success",
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

let fetchById = (type, keyword, selected, default_id, tag_id) => {
    return new Promise((resolve, reject) => {
        db.Tag.findAll({ where: { type: constant().tagType.default } })
            .then((default_tag) => {
                let default_tag_id = []
                _.forEach(default_tag, (val, key) => {
                    default_tag_id.push(val.id.toString())
                })
                let where = '';
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
                resolve(where)
            })
    })
}

let sendToMany = (email_list, subject, body, tag_id, default_id, email) => {
    return new Promise((resolve, reject) => {
        let email_send_success_list = [];
        let email_send_fail_list = [];
        let result = [];
        let emails = [];
        let where;
        db.Smtp.findOne({ where: { status: 1 } })
            .then((smtp_email) => {
                if (smtp_email) {
                    if (!tag_id) {
                        emails = email_list;
                        sendmail(smtp_email.email, function(response) {
                            resolve(response)
                        })
                    } else if (tag_id && default_id) {
                        where = { "tag_id": { "$in": [tag_id.toString()] }, "default_tag": default_id.toString() };
                    } else {
                        where = { tag_id: { "$in": [tag_id.toString()] } };
                    }
                    if (tag_id) {
                        email.find({ "$and": [where] }).exec(function(err, data) {
                            _.forEach(data, (val, key) => {
                                emails.push(val.sender_mail)
                            })
                            sendmail(smtp_email.email, function(response) {
                                resolve(response)
                            })
                        })
                    }
                } else {
                    reject("No active smtp email found!!")
                }
            })

        function sendmail(from, callback) {
            let to_email = emails.splice(0, 1);
            mail.sendMail(to_email[0], subject, "", from, body)
                .then((resp) => {
                    if (resp.status) {
                        email_send_success_list.push(to_email[0])
                    } else {
                        email_send_fail_list.push(to_email[0])
                    }
                    console.log(emails.length)
                    if (emails.length) {
                        sendmail(from, callback)
                    } else {
                        callback({ data: [{ email_send_success_list: email_send_success_list, email_send_fail_list: email_send_fail_list, message: "mail sent successfully" }] })
                    }
                })
                .catch((err) => { reject(err) })
        }
    })
}

let sendToSelectedTag = (id, email) => {
    return new Promise((resolve, reject) => {
        let email_send_success_list = [];
        let email_send_fail_list = [];
        db.Tag.findById(id)
            .then((data) => {
                if (data) {
                    db.Template.findById(data.template_id)
                        .then((template) => {
                            if (template) {
                                db.Smtp.findOne({ where: { status: 1 } })
                                    .then((smtp) => {
                                        email.find({ 'tag_id': { $in: [id.toString()] }, "$or": [{ is_automatic_email_send: 0, is_automatic_email_send: { $exists: false } }] }, { "_id": 1, "sender_mail": 1, "from": 1, "is_automatic_email_send": 1, "subject": 1 }).exec(function(err, result) {
                                            let emails = result;
                                            if (result.length) {
                                                sendTemplateToEmails(emails, template, smtp, function(err, data) {
                                                    if (err) {
                                                        reject(err)
                                                    } else {
                                                        resolve(data)
                                                    }
                                                })
                                            } else {
                                                reject("No Pending mails")
                                            }

                                            function sendTemplateToEmails(emails, template, smtp, callback) {
                                                let subject = "";
                                                if (!smtp) {
                                                    callback("Not active Smtp", null);
                                                }
                                                let email_id = emails.splice(0, 1)[0];
                                                replaceData.filter(template.body, email_id.from, id)
                                                    .then((html) => {
                                                        subject = constant().automatic_mail_subject + " " + template.subject;
                                                        mail.sendMail(email_id.sender_mail, subject, constant().smtp.text, smtp.email, html)
                                                            .then((response) => {
                                                                email.update({ "_id": email_id._id }, { is_automatic_email_send: 1 })
                                                                    .then((data1) => {
                                                                        if (response.status) {
                                                                            email_send_success_list.push(email_id.sender_mail)
                                                                        } else {
                                                                            email_send_fail_list.push(email_id.sender_mail)
                                                                        }
                                                                        if (emails.length) {
                                                                            sendTemplateToEmails(emails, template, smtp, callback)
                                                                        } else {
                                                                            callback(null, { data: [{ email_send_success_list: email_send_success_list, email_send_fail_list: email_send_fail_list, message: "mail sent successfully" }] })
                                                                        }
                                                                    })
                                                            })

                                                    })

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
        getDates(moment(new Date()).add(1, 'days'), lastDate, function(dateArray) {
            resolve(dateArray)
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
                                resolve({ message: "tag assigned sucessfully", data: data })
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
                    total_emails: imap_email.total_emails
                }
                result.push(imap_data)
                if (emails.length) {
                    findCount(emails, callback)
                } else {
                    callback(result)
                }
            })
        }
    })
}

let app_get_candidate = (email, email_id) => {
    return new Promise((resolve, reject) => {
        let rounds = []
        let scheduled_rounds = []
        _.forEach(constant().shedule_for, (val, key) => {
            scheduled_rounds.push(val.value)
        })
        email.findOne({ sender_mail: email_id, shedule_for: { "$in": scheduled_rounds } }, { "from": 1, "tag_id": 1, "shedule_date": 1, "shedule_time": 1, "shedule_for": 1, "push_message": 1, "push_status": 1 }).exec(function(err, response) {
            if (err) {
                reject({ error: 1, message: err, data: [] })
            } else {
                if (response) {
                    _.forEach(constant().shedule_for, (val, key) => {
                        if (val.value == response.shedule_for) {
                            rounds.push({ text: val.text, scheduled_time: response.shedule_time, scheduled_date: moment(response.shedule_date).format("MMM DD, YYYY"), status: 1 })
                        } else {
                            rounds.push({ text: val.text, scheduled_time: "", scheduled_date: "", status: 0 })
                        }
                        if (key == constant().shedule_for.length - 1) {
                            findSubject(response.tag_id[0], function(subject) {
                                resolve({ name: response.from, subject: subject, rounds: rounds, push_message: response.push_message, push_status: response.push_status })
                            })
                        }
                    })
                } else {
                    reject({ error: 1, message: "No data Found", data: [] })
                }
            }
        })

        function findSubject(tag_id, callback) {
            db.Tag.findById(parseInt(tag_id))
                .then((data) => { callback(data.subject) })
                .catch((err) => { reject(err) })
        }
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
    getFetchedMailCount,
    app_get_candidate
}