import Imap from "imap";
import BaseAPIController from "./BaseAPIController";
import ImapProvider from "../providers/ImapProvider";

export class ImapController extends BaseAPIController {

    /* Controller for Save Imap Data  */
	save = (req, res) => {
		ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
	this._db.Imap.create(data)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
})
            .catch(this.handleErrorResponse.bind(null, res));
	}

    /* Get Imapp data using id */
	idResult = (req, res, next, id) => {
		this.getById(req, res, this._db.Imap, id, next);
	}

    /* Imap data Update */
	update = (req, res) => {
		ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
	this._db.Imap.update(data, {
		where: {
			id: req.params.id
		}
	})
                    .then((data) => {
	if (data[0]) {
		this.handleSuccessResponse(res, null);
	} else {
		this.handleErrorResponse(res, "data not deleted");
	}
})
                    .catch(this.handleErrorResponse.bind(null, res));
})
            .catch(this.handleErrorResponse.bind(null, res));
	}

    /* Imap data delete */

	deleteImap = (req, res) => {
		this._db.Imap.destroy({
			where: {
				id: req.params.id
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

    /* Get Imap data */
	getImap = (req, res) => {
		this._db.Imap.findAll({
			offset: (req.params.page - 1) * 10,
			limit: 10
		})
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
	}

    /* Imap Active  Status */
	statusActive = (req, res) => {
		ImapProvider.statusActive(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then(() => {
	this._db.Imap.findOne({
		where: {
			email: req.body.email
		}
	})
                    .then((result) => {
	if (result) {
		let imap = new Imap({
			user: result.email,
			password: result.password,
			host: result.imap_server,
			port: result.server_port,
			tls: result.type
		});
		imap_connection(imap, (err) => {
			if (err) {
				res.json({
					status: 0,
					message: "error",
					data: err
				});
			} else {
				this._db.Imap.update({
					status: "FALSE"
				}, {
					where: {
						email: req.body.email
					}
				})
                                        .then((data) => {
	if (data[0] == 1) {
		res.json({
			status: 1,
			message: "success",
			data: "successfully Active changed to true"
		});
	} else if (data[0] == 0) {
		res.json({
			status: 0,
			message: "error",
			data: "user not found in database"
		});
	} else {
		res.json({
			status: 0,
			message: "error",
			data: "error"
		});
	}
})
                                        .catch(this.handleErrorResponse.bind(null, res));
			}
		});
	} else {
		res.json({
			status: 0,
			message: "error",
			data: "email not found in database"
		});
	}
})
                    .catch(this.handleErrorResponse.bind(null, res));
})
            .catch(this.handleErrorResponse.bind(null, res));
	}

}

function imap_connection(imap, callback) {
	function openInbox(cb) {
		imap.openBox("INBOX", true, cb);
	}
	imap.once("ready", function() {
		openInbox(function(err, box) {
			if (err) {
				callback(err);
			} else {
				callback("", box);
			}
			imap.end();
		});
	});
	imap.once("error", function(err) {
		callback(err);
	});
	imap.once("end", function() {
		console.log("Connection ended");
	});
	imap.connect();
}

const controller = new ImapController();
export default controller;
