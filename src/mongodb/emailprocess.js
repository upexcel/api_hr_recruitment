import * as _ from "lodash";
import db from "../db";
import constant from "../models/constant";

const fetchEmail = (page, tag_id, limit, type, keyword, selected, default_id, default_tag, db) => {
    return new Promise((resolve, reject) => {
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
        db.find(where, { "_id": 1, "date": 1, "email_date": 1, "is_automatic_email_send": 1, "from": 1, "sender_mail": 1, "subject": 1, "unread": 1, "attachment": 1, "tag_id": 1, "is_attachment": 1, "default_tag": 1 }).sort({ date: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec((err, data) => {
            if (err) {
                reject(err);
            } else {
                if (data[0] == null) {
                    var message = "No Result Found"
                }
                resolve(data, message);
            }
        });
    })
}


const findcount = (mongodb) => {
    return new Promise((resolve, reject) => {
        var count1 = [];
        var tagId = [];
        var mails_unread_count = 0;
        var mails_total_count = 0;
        var sub_child_list = [];
        var candidate_list = [];
        var final_data = [];
        db.Tag.findAll({ where: { type: "Automatic", is_job_profile_tag: 0 } })
            .then((tags) => {
                _.forEach(tags, (val, key) => {
                    tagId.push(val)
                })
                db.Tag.findAll({ where: { type: "Automatic", is_job_profile_tag: 1 } })
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
                                            if (val.title != constant().tagType.genuine) {
                                                default_id1.push(val);
                                            }
                                        })
                                        findCount(candidate_list, function(data1) {
                                            var array = [{ title: "candidate", data: data1 }, { title: "inbox", data: final_data }, { subject_for_genuine: constant().automatic_mail_subject }]
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
                var id1 = default_tag_id.splice(0, 1)[0];
                mongodb.find({ default_tag: id1.id }).exec(function(err, result1) {
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
                mongodb.find({ tag_id: { "$in": [tagId.id.toString()] } }, { tag_id: 1, default_tag: 1, unread: 1 }).exec(function(err, result) {
                    var unread = 0
                    _.forEach(result, (val, key) => {
                        if (val.unread === true) {
                            unread++;
                        }
                    })
                    sub_child_list = []
                    db.Tag.findAll({ where: { type: "Default" }, order: '`default_id` ASC' })
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
            mongodb.find({ tag_id: { "$in": [tagId.id.toString()] }, default_tag: default_tag_id.id }).exec(function(err, default_tag_mail) {
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
                // if (child.title != constant().tagType.genuine) {
                //     sub_child_list.push(child)
                // }
                sub_child_list.push(child)
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
    })
}

let assignMultiple = (where, body, mongodb) => {
    mongodb.update({ "_id": { "$in": body.mongo_id } }, where, { multi: true }).exec((err) => {
        if (err) {
            next(new Error(err));
        } else {
            mongodb.find({ "_id": { "$in": body.mongo_id } }, { "sender_mail": 1, "default_tag": 1 }).exec(function(err, response) {
                console.log(response)
                resolve({
                    status: 1,
                    message: "success"
                });
            })
        }
    });
}
export default {
    fetchEmail,
    findcount,
    assignMultiple
}