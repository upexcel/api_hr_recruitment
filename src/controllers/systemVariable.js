import BaseAPIController from "./BaseAPIController";

export class VariableController extends BaseAPIController {

    /* Get List of All Templates */
    variableList = (req, res, next) => {
        this._db.SystemVariable.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit),
                order: '`id` DESC'
            })
            .then((data) => { this.handleSuccessResponse(req, res, next, data) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

}

const controller = new VariableController();
export default controller;