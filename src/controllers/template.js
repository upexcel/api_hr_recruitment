import BaseAPIController from "./BaseAPIController";
import TemplateProvider from "../providers/TemplateProvider.js";
import replace from "../modules/replaceVariable";
import constant from "../models/constant";
import mail from "../modules/mail";
import db from "../db";
import config from "../config";
import logs from "../service/emaillogs";

export class TemplateController extends BaseAPIController {

    /* Controller for User Register  */
    create = (req, res, next) => {
        TemplateProvider.save(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((template) => {
                this._db.Template.create(template)
                    .then((data) => { this.handleSuccessResponse(req, res, next, data) })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Template Update */
    update = (req, res, next) => {
        TemplateProvider.save(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Template.update(data, {
                        where: {
                            id: req.params.templateId
                        }
                    })
                    .then((docs) => {
                        this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }


    /* Template delete */
    deleteTemplate = (req, res, next) => {
        db.Tag.findOne({ where: { template_id: req.params.templateId } })
            .then((data) => {
                if (!data) {
                    this._db.Template.destroy({
                            where: {
                                id: req.params.templateId
                            }
                        })
                        .then((docs) => {
                            this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                        }).catch(this.handleErrorResponse.bind(null, res));
                } else {
                    throw new Error("Template is Assigned to Tag")
                }
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get List of All Templates */
    templateList = (req, res, next) => {
        this._db.Template.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit),
                order: '`id` DESC'
            })
            .then((data) => this.handleSuccessResponse(req, res, next, data))
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* Template  Test */
    templateTest = (req, res, next) => {
        this._db.Template.findById(req.params.templateId)
            .then((data) => {
                replace.templateTest(data.body)
                    .then((data) => { this.handleSuccessResponse(req, res, next, data) })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Send Email */
    templateEmail = (req, res, next) => {
        TemplateProvider.templateEmail(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((template) => {
                this._db.Smtp.findOne({ where: { status: true } })
                    .then((data) => {
                        if (data) {
                            if (config.is_silent) {
                                mail.sendMail(req.params.email, template.subject, constant().smtp.text, data, template.body)
                                    .then((response) => {
                                        logs.emailLog(req, data.email_status)
                                            .then((response) => {
                                                this.handleSuccessResponse(req, res, next, response)
                                            })
                                    })
                            } else {
                                this.handleSuccessResponse(req, res, next, { message: "Tempelte Tested" })
                            }

                        } else {
                            throw new Error("Not Active Smtp Email is found")
                        }
                    })
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Variable data using id*/
    idResult = (req, res, next, templateId) => {
        this.getById(req, res, this._db.Template, templateId, next);
    }

    getTemplateById = (req, res, next) => {
        this._db.Template.findById(parseInt(req.params.templateId)).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }
}


const controller = new TemplateController();
export default controller;