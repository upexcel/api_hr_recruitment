import BaseAPIController from "./BaseAPIController";
import SmtpProvider from "../providers/SmtpProvider";
import constant from "../models/constant";
import mail from "../modules/mail";
import _ from "lodash";
import config from "../config.json";

export class SmtpController extends BaseAPIController {

    /* Controller for Save Smtp Data  */
    save = (req, res) => {
        SmtpProvider.save(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Smtp.create(data)
                    .then((data) => {
                        res.json({
                            data
                        })
                    }, (err) => {
                        throw new Error(res.json(400, {
                            message: "Data Already Saved"
                        }));
                    })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Smtp data Update */
    update = (req, res) => {
        SmtpProvider.save(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Smtp.update(data, {
                        where: {
                            id: req.params.smtpId
                        }
                    })
                    .then((docs) => {
                        this.handleSuccessResponse(res, null);
                    })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* Smtp data delete */
    deleteSmtp = (req, res) => {
        this._db.Smtp.destroy({
                where: {
                    id: req.params.smtpId
                }
            })
            .then((docs) => {
                this.handleSuccessResponse(res, null);
            }).catch(this.handleErrorResponse.bind(null, res));
    }


    /* Get Smtp data */
    getSmtp = (req, res) => {
        this._db.Smtp.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit),
                order: '`id` DESC'
            })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* get smtp by id*/
    getSmtpById = (req, res) => {
        res.json(req.result);
    }


    /* test smtp by email*/
    testSmtp = (req, res) => {
        this._db.Smtp.testSmtp(req.params.email)
            .then((response) => { res.json(response) })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* change smtp status*/
    changeStatus = (req, res) => {
        this._db.Smtp.changeStatus(req.params.email)
            .then((response) => { res.json(response) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Smtpp data using id */
    idResult = (req, res, next, smtpId) => {
        this.getById(req, res, this._db.Smtp, smtpId, next);
    }
}

const controller = new SmtpController();
export default controller;
