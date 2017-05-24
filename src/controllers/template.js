import BaseAPIController from "./BaseAPIController";
import TemplateProvider from "../providers/TemplateProvider.js";

export class TemplateController extends BaseAPIController {

    /* Controller for User Register  */
    create = (req, res) => {

        TemplateProvider.save(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((template) => {
                this._db.Template.create(template)
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

    /* Template Update */
    update = (req, res) => {
        TemplateProvider.save(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Template.update(data, {
                        where: {
                            id: req.params.templateId
                        }
                    })
                    .then((data) => {
                        if (data[0]) {
                            this.handleSuccessResponse(res, null);
                        } else {
                            this.handleErrorResponse(res, "Data Not Updated");
                        }
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }


    /* Template delete */
    deleteTemplate = (req, res) => {
        this._db.Template.destroy({
                where: {
                    id: req.params.templateId
                }
            })
            .then((data) => {
                if (data) {
                    this.handleSuccessResponse(res, null);
                } else {
                    this.handleErrorResponse(res, "Data Not Deleted");
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get List of All Templates */
    templateList = (req, res) => {
        this._db.Template.findAll({
                offset: (req.params.page - 1) * req.params.limit,
                limit: req.params.limit
            })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Variable data using id*/
    idResult = (req, res, next, templateId) => {
        this.getById(req, res, this._db.Template, templateId, next);
    }

}


const controller = new TemplateController();
export default controller;
