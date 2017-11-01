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
import logs from "../service/emaillogs";


export class FetchController extends BaseAPIController {
    /* Get INBOX data */
    fetch = (req, res, next) => {
        let { page, tag_id, limit } = req.params;
        let { type, keyword, selected, default_id, is_attach } = req.body;
        this._db.Tag.findAll({ where: { type: "Default" } })
            .then((default_tag) => {
                email_process.fetchEmail(page, tag_id, limit, type, keyword, selected, default_id, default_tag, req.email, is_attach)
                    .then((data, message) => {
                        this.handleSuccessResponse(req, res, next, {
                            data: data,
                            status: 1,
                            count: req.count,
                            message: (data.length) ? "SUCCESS" : "No Emails Found"
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
                            this.handleSuccessResponse(req, res, next, {
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
            .then((data) => { this.handleSuccessResponse(req, res, next, data) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    assignMultiple = (req, res, next) => {
        let where;
        MailProvider.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                let { tag_id } = req.params;
                email_process.assignMultiple(tag_id, req.body, req.email)
                    .then((data) => {
                        logs.emailLog(req, data.email_status)
                            .then((response) => {
                                this.handleSuccessResponse(req, res, next, data)
                            })
                    })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    deleteTag = (req, res, next) => {
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                email_process.deleteTag(req.params.tag_id, req.body.mongo_id, req.email)
                    .then((result) => {
                        this.handleSuccessResponse(req, res, next, result)
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
                req.email.update({ _id: mongo_id }, { unread: status, read_email_time: new Date(), read_by_user: req.user.email }, (error) => {
                    if (error) {
                        next(new Error(err));
                    } else {
                        this.handleSuccessResponse(req, res, next, { status: 1, message: "the unread status is successfully changed to " + req.params.status });
                    }
                });
            } else {
                this.handleSuccessResponse(req, res, next, { status: 0, message: "the unread status is not changed successfully,  you have to set status true or false" });
            }
        });
    }

    deleteEmail = (req, res, next) => {
        MailProvider.deleteEmail(req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                email_process.deleteEmail(req.params.tag_id, req.body.mongo_id, req.email)
                    .then((result) => { this.handleSuccessResponse(req, res, next, result) })
                    .catch(this.handleErrorResponse(null, res))
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    mailAttachment = (req, res, next) => {
        email_process.mailAttachment(req.params.mongo_id, req.email)
            .then((result) => { this.handleSuccessResponse(req, res, next, result) })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    findByTagId = (req, res, next, tag_id) => {
        let { type, keyword, selected, default_id, is_attach } = req.body;
        email_process.fetchById(type, keyword, selected, default_id, tag_id, is_attach)
            .then((data) => {
                this.getCount(req, res, next, data)
            })
    }

    sendToMany = (req, res, next) => {
        let { subject, body, tag_id, default_id } = req.body;
        email_process.sendToMany(req, req.body.emails, subject, body, tag_id, default_id, req.email)
            .then((response) => {
                this.handleSuccessResponse(req, res, next, response)
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    sendToSelectedTag = (req, res, next) => {
        email_process.sendToSelectedTag(req, req.body.tag_id, req.email)
            .then((result) => { this.handleSuccessResponse(req, res, next, result) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    fetchByButton = (req, res, next) => {
        inbox.fetchEmail(req.email, req.emailLogs, 'apiCall')
            .then((data) => { this.handleSuccessResponse(req, res, next, { status: 1, message: "success" }) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    app_get_candidate = (req, res, next) => {
        email_process.app_get_candidate(req.email, req.body.registration_id)
            .then((result) => { this.handleSuccessResponse(req, res, next, { error: 0, message: "", data: result }) })
            .catch((err) => { this.handleSuccessResponse(req, res, next, err) })
    }

    logs = (req, res, next) => {
        let { page, limit } = req.params;
        req.emailLogs.find().sort({ _id: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec()
            .then((result) => {
                req.emailLogs.count().exec()
                    .then((count) => {
                        this.handleSuccessResponse(req, res, next, { error: 0, message: "", data: result, count: count })
                    })
            })
            .catch((err) => { this.handleSuccessResponse(req, res, next, err) })
    }

    searchLogs = (req, res, next) => {
        let { page, email, limit } = req.params;
        req.emailLogs.find({ email: { "$regex": email } }).sort({ _id: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec()
            .then((result) => {
                req.emailLogs.count({ email: { "$regex": email } }).exec()
                    .then((count) => {
                        if (count)
                            this.handleSuccessResponse(req, res, next, { error: 0, message: "", data: result, count: count })
                        else
                            this.handleSuccessResponse(req, res, next, { error: 0, message: "No Result Found", data: [], count: count })
                    })
            })
            .catch((err) => { this.handleSuccessResponse(req, res, next, err) })
    }

    emailStatus = (req, res, next) => {
        email_process.checkEmailStatus(req)
            .then((response) => this.handleSuccessResponse(req, res, next, response))
            .catch(this.handleErrorResponse.bind(null, res))
    }

    fetchByDates = (req, res, next) => {
        email_process.findEmailByDates(req.params.days, req.email).then((response) => {
            this.handleSuccessResponse(req, res, next, { status: "SUCCESS" })
        }).catch((err) => { console.log(err) })
    }

    sendToNotReplied = (req, res, next) => {
        email_process.sendToNotReplied(req).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }

    sendBySelection = (req, res, next) => {
        email_process.sendBySelection(req).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }
    
    insert_note = (req, res, next) => {
        email_process.insert_note(req).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }
    
    update_note = (req, res, next) => {
        email_process.update_note(req).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }
    
    cron_status = (req, res, next) => {
        email_process.cron_status(req).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }

    archiveEmails = (req, res, next) => {
        email_process.archiveEmails(req.body, req.email, req.archived).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }

    markAsUnread = (req, res, next) => {
        req.email.update({ _id: req.body.mongo_id }, { unread: true }).then((response) => {
            this.handleSuccessResponse(req, res, next, { message: "marked as unread" })
        })
    }
}

const controller = new FetchController();
export default controller;