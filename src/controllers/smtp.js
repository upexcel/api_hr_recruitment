import BaseAPIController from "./BaseAPIController";
import SmtpProvider from "../providers/SmtpProvider";
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
		SmtpProvider.testSmtp(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then(() => {
	var email = req.body.email;
	var subject = "Smtp test";
	var from = "noreply@excellencetechnologies.in";
	var html = "Smtp test successfully";
	mail.mail_alert(email, subject, "template", from, html, function (response_msg, response_data, response) {
		if (response) {
			if (response.accepted) {
				res.json({status:1,message:"success",data:"message sent successfully"});
			} else {
				res.json({status:0,messsage:"error" , data:"message not sent successfully"});
			}
		}else{
			res.json({status:0,messsage:"error" , data:"message not sent successfully"});
		}
	});
})
							.catch(this.handleErrorResponse.bind(null, res));
	}

	/* change smtp status*/
	changeStatus = (req, res) => {
		SmtpProvider.testSmtp(this._db.Smtp, req.checkBody, req.body, req.getValidationResult())
            .then(() => {
	this._db.Smtp.findOne({ where: { email: req.body.email }})
            .then((data) =>{
	if(data){
		this._db.Smtp.findAll({})
            .then((data) =>{
	_.map(data,(val,key)=>{
		if(val.email == req.body.email){
			this._db.Smtp.update({ status: "TRUE" }, { where: { email: req.body.email }})
.then(()=>{
})
.catch(this.handleErrorResponse.bind(null, res));
		}else{
			this._db.Smtp.update({status:"FALSE"}, { where: { email: val.email} })
.then(()=>{
})
.catch(this.handleErrorResponse.bind(null, res));
		}
		if (key == (_.size(data) - 1)) {
			res.json({
				status: 1,
				message: "success",
				data:"status changed successfully"
			});
		}
	});
})
            .catch(this.handleErrorResponse.bind(null, res));
	}else{
		res.json({status:0,messsage:"error" , data:"email id is not found in database"});
	}
})
            .catch(this.handleErrorResponse.bind(null, res));

})
							.catch(this.handleErrorResponse.bind(null, res));
	}

}

const controller = new SmtpController();
export default controller;
