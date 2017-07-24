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
import email_process from "../mongodb/emailprocess";


export class FetchController extends BaseAPIController {
    /* Get INBOX data */
    fetch = (req, res, next) => {
        let { page, tag_id, limit } = req.params;
        let { type, keyword, selected, default_id } = req.body;
        this._db.Tag.findAll({ where: { type: "Default" } })
            .then((default_tag) => {
                email_process.fetchEmail(page, tag_id, limit, type, keyword, selected, default_id, default_tag, req.email)
                    .then((data, message) => {
                        res.json({
                            data: data,
                            status: 1,
                            count: req.count,
                            message: message || "success"
                        })
                    })
                    .catch(this.handleErrorResponse.bind(null, res))
            })
            .catch(this.handleErrorResponse.bind(null, res))
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
        email_process.findcount(req.email)
            .then((data) => { res.json(data) })
    }

    assignMultiple = (req, res, next) => {
        let where;
        MailProvider.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                let { tag_id, parent_id } = req.params;
                email_process.assignMultiple(tag_id, parent_id, req.body, req.email)
                    .then((data) => { res.json(data) })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    deleteTag = (req, res, next) => {
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                this._db.Tag.findOne({ where: { id: req.params.tag_id } })
                    .then((data) => {
                        if (data.id) {
                            _.each(req.body.mongo_id, (val, key) => {
                                req.email.findOneAndUpdate({ "_id": val }, { "$pull": { "tag_id": req.params.tag_id } }).exec((err) => {
                                    if (err) {
                                        next(new Error(err));
                                    } else {
                                        if (key == (_.size(req.body.mongo_id) - 1)) {
                                            res.json({ status: 1, message: "success" });
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
        req.email.find({ _id: mongo_id }, (err) => {
            if (err) {
                next(new Error(err));
            } else if (status == false) {
                req.email.update({ _id: mongo_id}, {unread: status}, (error) => {
                    if (error) {
                        next(new Error(err));
                    } else {
                        res.json({ status: 1, message: "the unread status is successfully changed to " + req.params.status });
                    }
                });
            } else {
                res.json({ status: 0, message: "the unread status is not changed successfully,  you have to set status true or false" });
            }
        });
    }

    deleteEmail = (req, res) => {
        let response = [];
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                let size = _.size(req.body.mongo_id);
                _.forEach(req.body.mongo_id, (val, key) => {
                    req.email.findOneAndUpdate({ "_id": val }, { "$pull": { "tag_id": req.params.tag_id } }, { new: true }).exec((err, data) => {
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
        let { type, keyword, selected, default_id } = req.body;
        email_process.fetchById(type, keyword, selected, default_id,tag_id)
        .then((data)=>{
            this.getCount(req, res, next, data)
        })
    }

    sendToMany = (req, res, next) => {
        let { subject, body, tag_id, default_id } = req.body;
        email_process.sendToMany( req.body.emails,subject, body, tag_id, default_id,req.email)
        .then((response)=>{res.json(response)})
        // let email_send_success_list = [];
        // let email_send_fail_list = [];
        // let result = [];
        // let emails = [];
        // let where;

        // db.Smtp.findOne({ where: { status: 1 } })
        //     .then((smtp_email) => {
        //         if (smtp_email) {
        //             if (!tag_id) {
        //                 emails = req.body.emails;
        //                 sendmail(smtp_email.email, function(response) {
        //                     res.json(response)
        //                 })
        //             } else if (tag_id && default_id) {
        //                 where = { "tag_id": { "$in": [tag_id.toString()] }, "default_tag": default_id.toString() };
        //             } else {
        //                 where = { tag_id: { "$in": [tag_id.toString()] } };
        //             }
        //             if (tag_id) {
        //                 req.email.find({ "$and": [where] }).exec(function(err, data) {
        //                     _.forEach(data, (val, key) => {
        //                         emails.push(val.sender_mail)
        //                     })
        //                     sendmail(smtp_email.email, function(response) {
        //                         res.json(response)
        //                     })
        //                 })
        //             }
        //         } else {
        //             throw new Error("No active smtp email found!!")
        //         }
        //     })
        //     .catch(this.handleErrorResponse.bind(null, res));

        // function sendmail(from, callback) {
        //     let to_email = emails.splice(0, 1);
        //     mail.sendMail(to_email[0], subject, "", from, body)
        //         .then((resp) => {
        //             if (resp.status) {
        //                 email_send_success_list.push(to_email[0])
        //             } else {
        //                 email_send_fail_list.push(to_email[0])
        //             }
        //             if (emails.length) {
        //                 sendmail(from, callback)
        //             } else {
        //                 callback({ data: [{ email_send_success_list: email_send_success_list, email_send_fail_list: email_send_fail_list, message: "mail sent successfully" }] })
        //             }
        //         })
        // }
    }

    sendToSelectedTag = (req, res, next) => {
        let email_send_success_list = [];
        let email_send_fail_list = [];
        let id = req.body.tag_id
        this._db.Tag.findById(id)
            .then((data) => {
                if (data) {
                    this._db.Template.findById(data.template_id)
                        .then((template) => {
                            if (template) {
                                this._db.Smtp.findOne({ where: { status: 1 } })
                                    .then((smtp) => {
                                        req.email.find({ 'tag_id': { $in: [id.toString()] }, "$or": [{ is_automatic_email_send: 0, is_automatic_email_send: { $exists: false } }] }, { "_id": 1, "sender_mail": 1, "from": 1, "is_automatic_email_send": 1, "subject": 1 }).exec(function(err, result) {
                                            let emails = result;
                                            if (result.length) {
                                                sendTemplateToEmails(emails, template, smtp, function(err, data) {
                                                    if (err) {
                                                        res.status(400).send({ message: err })
                                                    } else {
                                                        res.json(data)
                                                    }
                                                })
                                            } else {
                                                res.status(400).send({ message: "No Pending mails" })
                                            }

                                            function sendTemplateToEmails(emails, template, smtp, callback) {
                                                let subject = "";
                                                if (!smtp) {
                                                    callback("Not active Smtp", null);
                                                }
                                                let email_id = emails.splice(0, 1)[0];
                                                replaceData.filter(template.body, email_id.from, req.body.tag_id)
                                                    .then((html) => {
                                                        subject = constant().automatic_mail_subject + " " + template.subject;
                                                        mail.sendMail(email_id.sender_mail, subject, constant().smtp.text, smtp.email, html)
                                                            .then((response) => {
                                                                req.email.update({ "_id": email_id._id }, { is_automatic_email_send: 1 })
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
                                throw new Error("No template found")
                            }
                        })
                        .catch(this.handleErrorResponse.bind(null, res))
                } else {
                    throw new Error("Invalid Tag id")
                }
            })
            .catch(this.handleErrorResponse.bind(null, res))
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