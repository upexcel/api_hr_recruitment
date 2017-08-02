import Imap from "imap";
import BaseAPIController from "./BaseAPIController";
import ImapProvider from "../providers/ImapProvider";
import imapService from "../service/imap";
import db from "../db";
import moment from "moment";
import email_process from "../mongodb/emailprocess";

export class ImapController extends BaseAPIController {

    /* Controller for Save Imap Data  */
    save = (req, res, next) => {
        ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((dataValues) => {
                let tag = {
                    dataValues: {
                        email: dataValues.email,
                        password: dataValues.password
                    }
                }
                this._db.Imap.getCounts(tag, dataValues)
                    .then((data) => {
                        this._db.Imap.create(dataValues)
                            .then((data) => {
                                this.handleSuccessResponse(req, res, next, { data: data })
                            }).catch(this.handleErrorResponse.bind(null, res))
                    }).catch(this.handleErrorResponse.bind(null, res));
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap data Update */
    update = (req, res, next) => {
        ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Imap.update(data, {
                        where: {
                            id: req.params.imapId
                        }
                    })
                    .then((docs) => {
                        this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap data delete */
    deleteImap = (req, res, next) => {
        this._db.Imap.destroy({
                where: {
                    id: req.params.imapId
                }
            })
            .then((docs) => {
                this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Imap data */
    getImap = (req, res, next) => {
        this._db.Imap.findAll({ order: '`id` DESC' })
            .then((response) => {
                email_process.getFetchedMailCount(response, req.email)
                    .then((result) => { this.handleSuccessResponse(req, res, next, result) })
                    .catch(this.handleErrorResponse.bind(null, res))
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap Active  Status */
    statusActive = (req, res, next) => {
        this._db.Imap.imapTest(req.params.email)
            .then((data) => this.handleSuccessResponse(req, res, next, data))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Imapp data using id */
    idResult = (req, res, next, imapId) => {
        this.getById(req, res, this._db.Imap, imapId, next);
    }
}


const controller = new ImapController();
export default controller;