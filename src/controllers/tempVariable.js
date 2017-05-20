import BaseAPIController from "./BaseAPIController";
import VariableProvider from "../providers/tempVariableProvider.js";

export class VariableController extends BaseAPIController {

    /* Controller for User Register  */
	create = (req, res) => {
		VariableProvider.save(this._db, req.checkBody, req.body, req.getValidationResult())
            .then((user) => {
	this._db.Variable.create(user)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
})
            .catch(this.handleErrorResponse.bind(null, res));
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

.then((data) => {
	if (data[0]) {
		this.handleSuccessResponse(res, null);
	} else {
		this.handleErrorResponse(res, "data not Updated");
	}
}).catch(this.handleErrorResponse.bind(null, res));
})
.catch(this.handleErrorResponse.bind(null, res));
	}

    /* Template delete */
	deleteVariable = (req, res) => {
		this._db.Variable.destroy({
			where: {
				id: req.params.variableId
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

    /* Get List of All Templates */
	variableList = (req, res) => {
		this._db.Variable.findAll({
			offset: (req.params.page - 1) * 10,
			limit: 10
		})
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
	}

}



const controller = new VariableController();
export default controller;
