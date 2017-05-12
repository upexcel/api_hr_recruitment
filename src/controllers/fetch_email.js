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
                    data: data
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
                                        data: data
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
        req.email.aggregate([{
            $unwind: "$tag_id"
        }, {
            $group: {
                _id: {
                    tag_id: "$tag_id"
                },
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
            },
        }, ], function(err, result) {
            if (err) {
                next(new Error(err));
            } else {
                req.email.find({
                    $or: [{
                        tag_id: {
                            $exists: false
                        }
                    }, {
                        tag_id: {
                            $size: 0
                        }
                    }]
                }, function(err, result1) {
                    if (err) {
                        next(new Error(err));
                    } else {
                        result.push({
                            id: null,
                            count_email: result1.length
                        });
                        res.json({
                            data: result
                        });
                    }
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
}

const controller = new FetchController();
export default controller;