import moment from "moment";
import jwt from "jsonwebtoken";
import db from "../db";
import tag from "../models/constant";
// import BaseAPIController from "../controllers/BaseAPIController";

export class AuthController {
    // middleware for logged in users
	requiresLogin(req, res, next) {
		var token = req.param("accessToken");
		if (token) {
			jwt.verify(token, "secret_key", function(err, docs) {
				if (err) {
					next(res.status(400).send({error:"Invalid Token"}));
				} else {
					var endTime = moment().unix();
					var loginTime = docs.exp;
					if (loginTime > endTime) {
						req.token = docs.token;
						db.User.findById(req.token)
                            .then(function(user) {
	if (user) {
		req.user = user;
		next();
	} else {
		res.status(400).send({error:"Invalid User Token"});
		next();
	}
});
					}
				}
			});
		} else {
			res.status(400).send({error:"User is not logged in"});
			next();
		}
	}

	requiresAdmin(req, res, next) {
		var token = req.param("accessToken");
		if (token) {
			jwt.verify(token, "secret_key", function(err, docs) {
				if (err) {
					next(res.status(400).send({error:"Invalid Token"}));
				} else {
					var endTime = moment().unix();
					var loginTime = docs.exp;
					if (loginTime > endTime) {
						req.token = docs.token;
						db.User.find({ where: { id: req.token, user_type: tag().userType.admin } })
                            .then((admin) => {
	if (admin) {
		req.user = admin;
		next();
	} else {
		res.status(400).send({error:"You Are Not Authorized"});
		next();
	}
});
					}
				}
			});
		} else {
			next(res.status(400).send({error:"User is not logged in"}));
		}
	}

	requiresAdminOrHr(req, res, next) {
		var token = req.param("accessToken");
		if (token) {
			jwt.verify(token, "secret_key", function(err, docs) {
				if (err) {
					next(res.status(400).send({error:"Invalid Token"}));
				} else {
					var endTime = moment().unix();
					var loginTime = docs.exp;
					if (loginTime > endTime) {
						req.token = docs.token;
						db.User.find({ where: { id: req.token, $or:[ {user_type: tag().userType.admin }, { user_type: tag().userType.hr } ] }})
						.then((user) => {
							if (user) {
								req.user = user;
								next();
							} else {
								next(res.status(400).send({error:"You Are Not Authorized"}));
							}
						});
					}
				}
			});
		} else {
			next(res.status(400).send({error:"User is not logged in"}));
		}
	}
}

const controller = new AuthController();
export default controller;
