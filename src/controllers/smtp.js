import BaseAPIController from "./BaseAPIController";
import SmtpProvider from "../providers/SmtpProvider";
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
                            error: err
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
                    .then((data) => {
                        this.handleSuccessResponse(res, null);
                    }, (err) => {
                        throw new Error(res.json(400, {
                            error: err.errors[0]['message']
                        }));
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
        this._db.Smtp.findAll({
                offset: (req.params.page - 1) * req.params.limit,
                limit: req.params.limit
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
        SmtpProvider.testSmtp(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                let email = req.body.email;
                mail.mail_alert(email, config.subject, "template", config.from, config.html, function(response_msg, response_data, response) {
                    if (response.accepted) {
                        this.handleSuccessResponse(res, null);
                    } else {
                        throw new Error(res.json(400, {
                            error: "Message not sent successfully"
                        }))
                    }
                });
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* change smtp status*/
    changeStatus = (req, res) => {
        SmtpProvider.testSmtp(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                this._db.Smtp.findOne({
                        where: {
                            email: req.body.email
                        }
                    })
                    .then((data) => {
                        this._db.Smtp.findAll({})
                            .then((data) => {
                                _.map(data, (val, key) => {
                                    if (val.email == req.body.email) {
                                        this._db.Smtp.update({
                                            status: "TRUE"
                                        }, {
                                            where: {
                                                email: req.body.email
                                            }
                                        })
                                    } else {
                                        this._db.Smtp.update({
                                            status: "FALSE"
                                        }, {
                                            where: {
                                                email: val.email
                                            }
                                        })
                                    }
                                    if (key == (_.size(data) - 1)) {
                                        this.handleSuccessResponse(res, null);
                                    }
                                })
                            }, (err) => {
                                throw new Error(res.json(400, {
                                    error: "Status Not Changed "
                                }))
                            })
                    }, (err) => {
                        throw new Error(res.json(400, {
                            error: " Email Id is not found in database "
                        }))
                    })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Smtpp data using id */
    idResult = (req, res, next, smtpId) => {
        this.getById(req, res, this._db.Smtp, smtpId, next);
    }

}

const controller = new SmtpController();
export default controller;
