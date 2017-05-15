import BaseAPIController from "./BaseAPIController";
import MailProvider from "../providers/MailProvider";
import * as _ from "lodash";


export class FetchController extends BaseAPIController {
    /* Get INBOX data */
    fetch = (req, res, next) => {
        var page = req.body.page;
        var tag_id = req.body.tag_id;
        if (!page || !isNaN(page) == false || page <= 0) {
            page = 1;
        }
        if (!tag_id || !isNaN(tag_id) == false || tag_id <= 0) {
            tag_id = undefined;
        }
        req.email.find({
            tag_id: {
                $in: [tag_id]
            }
        }).skip((page - 1) * 21).limit(21).exec(function(err, data) {
            if (err) {
                next(err);
            } else {
                res.json({
                    data: data,
                    status: 1,
                    message: "success"
                });
            }
        });
    }

    assignTag = (req, res, next) => {
        MailProvider.assignTag(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                this._db.Tag.tag(req.body.tag_id)
                    .then((data) => {
                        if (data.status) {
                            req.email.findOneAndUpdate({
                                "_id": req.body.mongo_id
                            }, {
                                "$addToSet": {
                                    "tag_id": req.body.tag_id
                                }
                            }).exec(function(err, data) {
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
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    countEmail = (req, res, next) => {
        var count = [];

        // .catch(this.handleErrorResponse.bind(null, res));
        req.email.aggregate({
            $unwind: {
                path: "$tag_id",
                preserveNullAndEmptyArrays: true
            }
        }, {
            $group: {
                _id: "$tag_id",
                count_email: {
                    $sum: 1
                },
                unread: {
                    $sum: {
                        $cond: [{
                            $eq: ["$unread", "false"]
                        }, 0, 1]
                    }
                }
            }
        }, (err, result) => {
            if (err) {
                next(new Error(err));
            } else {
                this._db.Tag.findAll()
                    .then((data) => {
                        _.forEach(result, (val, key) => {
                            _.forEach(data, (val1, key1) => {
                                console.log(val, val1)
                                if (val._id == val1.id) {
                                    count.push(_.merge(val, val1));
                                }
                            })
                            if (val._id == null) {
                                count.push(_.merge(val, {
                                    title: "Mails",
                                    color: "#81d4fa",
                                    type: "Default"
                                }));
                            }
                        });
                        res.json({
                            data: count,
                            status: 1,
                            message: "success"
                        })
                    });
            }
        });
    }

    assignMultiple = (req, res, next) => {
        MailProvider.assignTag(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                this._db.Tag.tag(req.body.tag_id)
                    .then((data) => {
                        if (data.status) {
                            _.each(req.body.mongo_id, function(val, key) {
                                req.email.findOneAndUpdate({
                                    "_id": val
                                }, {
                                    "$addToSet": {
                                        "tag_id": req.body.tag_id
                                    }
                                }).exec(function(err) {
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
        MailProvider.assignTag(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                this._db.Tag.tag(req.body.tag_id)
                    .then((data) => {
                        if (data.status) {
                            _.each(req.body.mongo_id, function(val, key) {
                                req.email.findOneAndUpdate({
                                    "_id": val
                                }, {
                                    "$pull": {
                                        "tag_id": req.body.tag_id
                                    }
                                }).exec(function(err) {
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
        MailProvider.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                req.email.find({
                    mongo_id: req.body.mongo_id
                }, function(err, result) {
                    if (err) {
                        next(new Error(err));
                    } else if (req.body.status == 'true' || req.body.status == 'false') {
                        req.email.update({
                            mongo_id: req.body.mongo_id
                        }, {
                            unread: req.body.status,
                        }, function(error) {
                            if (error) {
                                next(new Error(err));
                            } else {
                                res.json({
                                    status: 1,
                                    message: 'the unread status is successfully changed to ' + req.body.status
                                });
                            }
                        });
                    } else {
                        res.json({
                            status: 0,
                            message: 'the unread status is not changed successfully,  you have to set status true or false'
                        });
                    }
                });

            })
            .catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new FetchController();
export default controller;