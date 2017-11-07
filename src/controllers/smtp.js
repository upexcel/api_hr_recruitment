import BaseAPIController from "./BaseAPIController";
import SmtpProvider from "../providers/SmtpProvider";
import constant from "../models/constant";
import mail from "../modules/mail";
import _ from "lodash";
import config from "../config";

export class SmtpController extends BaseAPIController {

    /* Controller for Save Smtp Data  */
    save = (req, res, next) => {
        SmtpProvider.save(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                mail.sendMail(data.email, constant().smtp.subject, constant().smtp.text, data, constant().smtp.html)
                    .then((response) => {
                        this._db.Smtp.create(data)
                            .then((data) => {
                                this._db.Smtp.changeStatus(data.email)
                                    .then((response_status) => {
                                        this.handleSuccessResponse(req, res, next, { response_status, data: data.dataValues })
                                    })
                            }, (err) => {
                                throw new Error(res.json(400, {
                                    message: "Data Already Saved"
                                }));
                            })
                            .catch(this.handleErrorResponse.bind(null, res));
                    })
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Smtp data Update */
    update = (req, res, next) => {
        SmtpProvider.save(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Smtp.update(data, {
                        where: {
                            id: req.params.smtpId
                        }
                    })
                    .then((docs) => {
                        this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                    })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* Smtp data delete */
    deleteSmtp = (req, res, next) => {
        this._db.Smtp.destroy({
                where: {
                    id: req.params.smtpId
                }
            })
            .then((docs) => {
                this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
            }).catch(this.handleErrorResponse.bind(null, res));
    }


    /* Get Smtp data */
    getSmtp = (req, res, next) => {
        this._db.Smtp.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit),
                order: '`id` DESC'
            })
            .then((data) => this.handleSuccessResponse(req, res, next, data))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* get smtp by id*/
    getSmtpById = (req, res, next) => {
        this.handleSuccessResponse(req, res, next, req.result);
    }


    /* test smtp by email*/
    testSmtp = (req, res, next) => {
        this._db.Smtp.testSmtp(req.params.email)
            .then((response) => { this.handleSuccessResponse(req, res, next, response) })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* change smtp status*/
    changeStatus = (req, res, next) => {
        this._db.Smtp.changeStatus(req.params.email)
            .then((response) => { this.handleSuccessResponse(req, res, next, response) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Smtpp data using id */
    idResult = (req, res, next, smtpId) => {
        this.getById(req, res, this._db.Smtp, smtpId, next);
    }
}

const controller = new SmtpController();
export default controller;