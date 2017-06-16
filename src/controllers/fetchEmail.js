import BaseAPIController from "./BaseAPIController";
import MailProvider from "../providers/MailProvider";
import Attachment from "../modules/getAttachment";
import imap from "../service/imap";
import * as _ from "lodash";
import inbox from "../inbox";


export class FetchController extends BaseAPIController {
    /* Get INBOX data */
    fetch = (req, res, next) => {
        let { page, tag_id, limit } = req.params;
        let { type, keyword } = req.body;
        var where = '';
        if (!page || !isNaN(page) == false || page <= 0) {
            page = 1;
        }
        if (!isNaN(tag_id) == false) {
            if (type == "email") {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' } }
            } else {
                where = { 'subject': { "$regex": keyword, '$options': 'i' } }
            }
        } else if (tag_id) {
            if (type == "email") {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id }
            } else {
                where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id }
            }
        } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {
            where = { tag_id: { $size: 0 } };
        } else {
            where = { tag_id: { $in: [tag_id] } }
        }
        req.email.find(where, { "date": 1, "email_date": 1, "from": 1, "sender_mail": 1, "subject": 1, "unread": 1, "attachment": 1 }).sort({ email_timestamp: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec((err, data) => {
            if (err) {
                next(err);
            } else {
                res.json({
                    data: data,
                    status: 1,
                    count: req.count,
                    message: "success"
                });
            }
        });
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
        var totalCount = [];
        var count1 = [];
        var tagId = [];
        req.email.aggregate({
            $group: {
                _id: "$tag_id",
                count_email: {
                    $sum: 1
                },
                unread: {
                    $sum: {
                        $cond: [{
                            $eq: ["$unread", false]
                        }, 0, 1]
                    },
                },
            }
        }, (err, result) => {
            if (err) {
                next(new Error(err));
            } else {
                this._db.Tag.findAll()
                    .then((data) => {
                        _.forEach(data, (val2) => {
                            tagId.push(val2.id.toString());
                        });
                        _.map(tagId, (val) => {
                            var res = filter(val);
                            totalCount.push(res);
                        });
                        _.forEach(result, (val) => {
                            if (val._id.length == 0) {
                                count1.push(_.merge(val, {
                                    title: "Mails",
                                    color: "#81d4fa",
                                    type: "Main"
                                }));
                            }
                        });

                        function filter(tagId) {
                            var b = _.filter(result, (o) => {
                                if (_.includes(o._id, tagId)) {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                            var count_email = 0;
                            var unread = 0;
                            _.map(b, (val) => {
                                count_email += val.count_email;
                                unread += val.unread;
                            });
                            return {
                                id: tagId,
                                count_email: count_email,
                                unread: unread
                            };
                        }
                        _.forEach(totalCount, (val) => {
                            _.forEach(data, (val1) => {
                                if (val.id == val1.id) {
                                    count1.push(_.merge(val, {
                                        title: val1.title,
                                        color: val1.color,
                                        type: val1.type
                                    }));
                                }
                            });
                        });
                        res.json({
                            data: count1,
                            status: 1,
                            message: "success"
                        });
                    });
            }
        });
    }

    assignMultiple = (req, res, next) => {
        MailProvider.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                let { tag_id } = req.params;
                this._db.Tag.findOne({
                        where: {
                            id: tag_id
                        }
                    })
                    .then((data) => {
                        if (data.id) {
                            _.each(req.body.mongo_id, (val, key) => {
                                if (data.type == "Default") {
                                    var where = { "tag_id": [tag_id], "email_timestamp": new Date().getTime() };
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
        });
    }

    findByTagId = (req, res, next, tag_id) => {
        var where;
        let { type, keyword } = req.body;
        if (!isNaN(tag_id) == false) {
            if (type == "email") {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' } }
            } else {
                where = { 'subject': { "$regex": keyword, '$options': 'i' } }
            }
        } else if (tag_id) {
            if (type == "email") {
                where = { 'sender_mail': { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id }
            } else {
                where = { "subject": { "$regex": keyword, '$options': 'i' }, 'tag_id': tag_id }
            }
        } else if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {
            where = { tag_id: { $size: 0 } };
        } else {
            where = { tag_id: { $in: [tag_id] } }
        }
        this.getCount(req, res, next, where)
    }

    fetchByButton = (req, res) => {
        inbox.fetchEmail(req.email, 'apiCall')
            .then((data) => {
                req.email.find({}, { "date": 1, "email_date": 1, "from": 1, "sender_mail": 1, "subject": 1, "unread": 1, "attachment": 1 }).sort({ email_timestamp: -1 }).exec((err, response) => {
                    if (err) {
                        next(err);
                    } else {
                        res.json({ data: response, status: 1, count: req.count, message: "success" });
                    }
                })
            });
    }
}

const controller = new FetchController();
export default controller;
