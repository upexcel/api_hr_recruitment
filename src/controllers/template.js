import BaseAPIController from "./BaseAPIController";
import TemplateProvider from "../providers/TemplateProvider.js";

export class TemplateController extends BaseAPIController {

    /* Controller for User Register  */
	create = (req, res) => {
		TemplateProvider.save(this._db, req.checkBody, req.body, req.getValidationResult()).then((user) => {
			this._db.Template.create(user)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
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
		this.handleErrorResponse(res, "data not Updated");
	}
})
                    .catch(this.handleErrorResponse.bind(null, res));
})
            .catch(this.handleErrorResponse.bind(null, res));
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
		this.handleErrorResponse(res, "data not deleted");
	}
})
            .catch(this.handleErrorResponse.bind(null, res));
	}

    /*Get List of All Templates*/
	templateList = (req, res) => {
		this._db.Template.findAll()
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
	}

}



const controller = new TemplateController();
export default controller;
