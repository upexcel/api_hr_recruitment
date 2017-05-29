import BaseAPIController from "./BaseAPIController";
import SmtpProvider from "../providers/SmtpProvider";
import constant from "../models/constant";
var mail = require("../modules/mail");
var _ = require("lodash");

export class SmtpController extends BaseAPIController {

    /* Controller for Save Smtp Data  */
    save = (req, res) => {
        SmtpProvider.save(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Smtp.create(data)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Smtpp data using id */
    idResult = (req, res, next, smtpId) => {
        this.getById(req, res, this._db.Smtp, smtpId, next);
    }

    /* Smtp data Update */
    update = (req, res) => {
        SmtpProvider.save(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Smtp.update(data, { where: { id: req.params.smtpId } })
                    .then((data) => {
                        if (data[0]) {
                            this.handleSuccessResponse(res, null);
                        } else {
                            this.handleErrorResponse(res, "data not Updated");
                        }
                    })
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Smtp data delete */
    deleteSmtp = (req, res) => {
        this._db.Smtp.destroy({ where: { id: req.params.smtpId } })
            .then((data) => {
                if (data) {
                    this.handleSuccessResponse(res, null);
                } else {
                    this.handleErrorResponse(res, "data not deleted");
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Smtp data */
    getSmtp = (req, res) => {
        this._db.Smtp.findAll({ offset: (req.params.page - 1) * 10, limit: 10 })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* get smtp by id*/
    getSmtpById = (req, res) => {
        res.json(req.result);
    }

    /* test smtp by email*/

    testSmtp = (req, res) => {
        mail.mail_alert(req.params.email, constant().smtp.subject, "template", constant().smtp.from, constant().smtp.html, function(response_msg, response_data, response) {
            if (response) {
                if (response.accepted) {
                    res.json({ status: 1, message: "success", data: "message sent successfully" });
                } else {
                    res.json({ status: 0, messsage: "error", data: "message not sent successfully" });
                }
            } else {
                res.json({ status: 0, messsage: "error", data: "message not sent successfully" });
            }
        })
    }

    /* change smtp status*/
    changeStatus = (req, res) => {
        this._db.Smtp.smtpTest(req.params.email)
            .then((response) => { res.json(response) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

}

const controller = new SmtpController();
export default controller;
