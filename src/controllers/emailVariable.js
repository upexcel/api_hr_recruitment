import BaseAPIController from "./BaseAPIController";
import VariableProvider from "../providers/EmailVariableProvider.js";

export class VariableController extends BaseAPIController {

    /* Controller for User Register  */
    create = (req, res, next) => {
        VariableProvider.save(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((variable) => {
                this._db.Variable.create(variable)
                  .then(res.json.bind(res))
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Template Update */
    update = (req, res) => {
        VariableProvider.save(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Variable.update(data, {
                        where: {
                            id: req.params.variableId
                        }
                    })
                    .then((docs) => {
                            this.handleSuccessResponse(res, null);
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }



    /* Template delete */
    deleteVariable = (req, res) => {
        this._db.Variable.destroy({
                where: {
                    id: req.params.variableId
                }
            })
            .then((docs) => {
                    this.handleSuccessResponse(res, null);
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get List of All Templates */
    variableList = (req, res) => {
        this._db.Variable.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit)
            })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* Get Variable data using id*/
    idResult = (req, res, next, variableId) => {
        this.getById(req, res, this._db.Variable, variableId, next);
    }

}

const controller = new VariableController();
export default controller;
