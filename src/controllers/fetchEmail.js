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
        this._db.Tag.findOne({ where: { id: tag_id } })
            .then((data) => {
                if (data.id) {
                    req.email.findOneAndUpdate({ "_id": mongo_id }, { "$addToSet": { "tag_id": tag_id }, email_timestamp: new Date().getTime() }).exec((err, data) => {
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
            .catch(this.handleErrorResponse.bind(null, res));
    }

    assignMultiple = (req, res, next) => {
        let where;
        MailProvider.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                let { tag_id } = req.params;
                email_process.assignMultiple(tag_id, req.body, req.email)
                    .then((data) => {
                        this._db.Candidate_device.pushNotification(data)
                            .then((pushdata) => { res.json(data) })
                    })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    deleteTag = (req, res, next) => {
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                email_process.deleteTag(req.params.tag_id, req.body.mongo_id, req.email)
                    .then((result) => {
                        res.json(result)
                    })
                    .catch(this.handleErrorResponse(null, res));
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
                req.email.update({ _id: mongo_id }, { unread: status }, (error) => {
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
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                email_process.deleteEmail(req.params.tag_id, req.body.mongo_id, req.email)
                    .then((result) => { res.json(result) })
                    .catch(this.handleErrorResponse(null, res))
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    mailAttachment = (req, res, next) => {
        email_process.mailAttachment(req.params.mongo_id, req.email)
            .then((result) => { res.json(result) })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    findByTagId = (req, res, next, tag_id) => {
        let { type, keyword, selected, default_id } = req.body;
        email_process.fetchById(type, keyword, selected, default_id, tag_id)
            .then((data) => {
                this.getCount(req, res, next, data)
            })
    }

    sendToMany = (req, res, next) => {
        let { subject, body, tag_id, default_id } = req.body;
        email_process.sendToMany(req.body.emails, subject, body, tag_id, default_id, req.email)
            .then((response) => {
                console.log(response);
                res.json(response)
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    sendToSelectedTag = (req, res, next) => {
        email_process.sendToSelectedTag(req.body.tag_id, req.email)
            .then((result) => { res.json(result) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    fetchByButton = (req, res, next) => {
        inbox.fetchEmail(req.email, 'apiCall')
            .then((data) => { res.json({ status: 1, message: "success" }) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    app_get_candidate = (req, res, next) => {
        email_process.app_get_candidate(req.email, req.body.email_id)
            .then((result) => { res.json({ error: 0, message: "", data: result }) })
            .catch((err) => { res.json(err) })
    }
}

const controller = new FetchController();
export default controller;