import moment from "moment";
import jwt from "jsonwebtoken";
import db from "../db";
import tag from "../models/constant";


export class AuthController {
    // middleware for logged in users
	requiresLogin(req, res, next) {
		var token = req.param("accessToken");
		if (token) {
			jwt.verify(token, "secret_key", function(err, docs) {
				if (err) {
					next(new Error(err));
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
		next(new Error("Invalid User Token"));
	}
});
					}
				}
			});
		} else {
			next(new Error("User is not logged in"));
		}
	}

	requiresAdmin(req, res, next) {
		var token = req.param("accessToken");
		if (token) {
			jwt.verify(token, "secret_key", function(err, docs) {
				if (err) {
					next(new Error(err));
				} else {
					var endTime = moment().unix();
					var loginTime = docs.exp;
					if (loginTime > endTime) {
						req.token = docs.token;
						console.log(tag().userType.admin);
						db.User.find({ where: { id: req.token, user_type: tag().userType.admin } })
                            .then((admin) => {
	if (admin) {
		req.user = admin;
		next();
	} else {
		next(new Error("You Are Not Authorized"));
	}
});
					}
				}
			});
		} else {
			next(new Error("User is not logged in"));
		}
	}

	requiresAdminOrHr(req, res, next) {
		var token = req.param("accessToken");
		if (token) {
			jwt.verify(token, "secret_key", function(err, docs) {
				if (err) {
					next(new Error(err));
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
								next(new Error("You Are Not Authorized"));
							}
						});
					}
				}
			});
		} else {
			next(new Error("User is not logged in"));
		}
	}
}

const controller = new AuthController();
export default controller;
