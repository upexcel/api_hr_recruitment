import BaseAPIController from "./BaseAPIController";
import MailProvider from "../providers/MailProvider";
import * as _ from "lodash";
import Imap from "imap";
import in_array from "in_array";
import fs from "fs";
import base64 from "base64-stream";
import path from "path";
import multer from "multer";
import google from "googleapis";
var OAuth2 = google.auth.OAuth2;
var upload = multer({
    dest: "uploads/"
});
import db from "../db";
import config from "../config.json";
import GENERIC from "../modules/generic";
var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);
oauth2Client.setCredentials({
    access_token: config.access_token,
    token_type: config.token_type,
    expires_in: config.expires_in,
    refresh_token: config.refresh_token
});
var drive = google.drive({
    version: "v2",
    auth: oauth2Client
});
export class FetchController extends BaseAPIController {
    /* Get INBOX data */
    fetch = (req, res, next) => {
        let {
            page,
            tag_id,
            limit
        } = req.params;
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
        }).skip((page - 1) * limit).limit(parseInt(limit)).sort({
            uid: -1
        }).exec((err, data) => {
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
    };

    assignTag = (req, res, next) => {
        let {
            tag_id,
            mongo_id
        } = req.params;
        this._db.Tag.findOne({
                where: {
                    id: tag_id
                }
            })
            .then((data) => {
                if (data.id) {
                    req.email.findOneAndUpdate({
                        "_id": mongo_id
                    }, {
                        "$addToSet": {
                            "tag_id": tag_id
                        }
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
                            if (val._id == null) {
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
                let {
                    tag_id
                } = req.params;
                this._db.Tag.findOne({
                        where: {
                            id: tag_id
                        }
                    })
                    .then((data) => {
                        if (data.id) {
                            _.each(req.body.mongo_id, (val, key) => {
                                req.email.findOneAndUpdate({
                                    "_id": val
                                }, {
                                    "$addToSet": {
                                        "tag_id": tag_id
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
        let {
            mongo_id,
            status
        } = req.params;
        MailProvider.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                req.email.find({
                    mongo_id: mongo_id
                }, (err) => {
                    if (err) {
                        next(new Error(err));
                    } else if (status == "true" || status == "false") {
                        req.email.update({
                            mongo_id: mongo_id
                        }, {
                            unread: status,
                        }, (error) => {
                            if (error) {
                                next(new Error(err));
                            } else {
                                res.json({
                                    status: 1,
                                    message: "the unread status is successfully changed to " + req.body.status
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
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    deleteEmail = (req, res) => {
        var response = [];
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                var size = _.size(req.body.mongo_id);
                _.forEach(req.body.mongo_id, (val, key) => {
                    req.email.findOne({
                        _id: val
                    }, (err, data) => {
                        if (err) {
                            response.push({
                                status: 0,
                                message: err,
                                array_length: key
                            });
                        }
                        if (!data) {
                            response.push({
                                status: 0,
                                msg: "not found",
                                array_length: key
                            });
                        } else {
                            data.remove();
                            response.push({
                                status: 1,
                                msg: "delete success",
                                array_length: key
                            });
                        }
                        if (key == (size - 1)) {
                            res.json({
                                status: 1,
                                message: "success",
                                data: response
                            });
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
                    let sender_mail = data.get("sender_mail");
                    let to = data.get("to");
                    let uid = data.get("uid");
                    this._db.Imap.findOne({ email: to })
                        .then((data) => {
                            var imap = new Imap({
                                user: data.dataValues.email,
                                password: data.dataValues.password,
                                host: data.dataValues.imap_server,
                                port: data.dataValues.server_port,
                                tls: data.dataValues.type,
                            });
                            get_attachment(imap, uid)
                                .then((response) => {
                                    req.email.findOneAndUpdate({ _id: req.params.mongo_id }, { $set: { attachment: response } }, (err, response) => {
                                        if (err) {
                                            res.json({ status: 0, message: err });
                                        } else {
                                            res.json({ status: 1, message: " attachment save successfully", data: response });
                                        }
                                    });
                                })
                                .catch(this.handleErrorResponse.bind(null, res));
                        });
                } else {
                    res.json({ status: 0, message: 'mongo_id not found in database' });
                }
            }
        });
    }
}

function get_attachment(imap, uid) {
    return new Promise((resolve, reject) => {
        function openInbox(cb) {
            imap.openBox("INBOX", true, cb);
        }
        imap.once("ready", () => {
            openInbox(() => {
                var f = imap.fetch(uid, {
                    bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                    struct: true
                });
                f.on("message", (msg, seqno) => {
                    var prefix = "(#" + seqno + ") ";
                    msg.once("attributes", (attrs) => {
                        var attachments = findAttachmentParts(attrs.struct);
                        var len = attachments.length,
                            uid = attrs.uid,
                            flag = attrs.flags;
                        for (var i = 0; i < len; ++i) {
                            var attachment = attachments[i];
                            var f = imap.fetch(attrs.uid, {
                                bodies: [attachment.partID],
                                struct: true
                            });
                        }
                        if (attachments[0] == null) {
                            resolve(attachments);
                        } else {
                            f.on("message", buildAttMessageFunction(attachment, uid, flag, seqno));
                        }
                    });
                    msg.once("end", () => {
                        console.log(prefix + "Finished");
                    });
                });
                f.once("error", (err) => {
                    reject("Fetch error: " + err);
                });
                f.once("end", () => {
                    console.log("Done fetching all messages!");
                    imap.end();
                });
            });
        });

        function findAttachmentParts(struct, attachments) {
            attachments = attachments || [];
            var len = struct.length;
            for (var i = 0; i < len; ++i) {
                if (Array.isArray(struct[i])) {
                    findAttachmentParts(struct[i], attachments);
                } else if (struct[i].disposition && ["INLINE", "ATTACHMENT"].indexOf(struct[i].disposition.type) > 0) {
                    attachments.push(struct[i]);
                }
            }
            return attachments;
        }

        function buildAttMessageFunction(attachment, uid, flag) {
            var filename = attachment.disposition.params.filename;
            var encoding = attachment.encoding;
            var filepath = path.join(__dirname, "/./uploads/", filename);
            return (msg, seqno) => {
                var prefix = "(#" + seqno + ") ";
                msg.on("body", (stream) => {
                    var writeStream = fs.createWriteStream(filepath);
                    if (encoding === "BASE64") {
                        stream.pipe(base64.decode()).pipe(writeStream);
                    } else {
                        stream.pipe(writeStream);
                    }
                    fs.readFile(filepath, {
                        encoding: "utf8"
                    }, (error, data) => {
                        var fileMetadata = {
                            title: filename,
                            mimeType: "text/plain/javascript/html/csv/application/pdf"
                        };
                        var media = {
                            mimeType: "text/plain/javascript/html/csv/application/pdf",
                            body: data
                        };
                        drive.files.insert({
                            resource: fileMetadata,
                            media: media,
                            fields: "id"
                        }, (err, file) => {
                            if (!err) {
                                var attachment_file = [{
                                    name: attachment.disposition.params.filename,
                                    link: "https://drive.google.com/file/d/" + file.id + "/view"
                                }];
                                resolve(attachment_file);
                            } else {
                                reject(err);
                            }
                        });
                    });
                    fs.unlink(filepath, () => {
                        console.log("success");
                    });
                });
                msg.once("end", () => {
                    console.log(prefix + "Finished attachment %s", filename);
                });
            };
        }
        imap.once("error", (err) => {
            reject(err);
        });
        imap.once("end", () => {
            console.log("Connection ended");
        });
        imap.connect();
    })

}

const controller = new FetchController();
export default controller;
