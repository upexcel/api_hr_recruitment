import moment from "moment";
import jwt from "jsonwebtoken";
import db from "../db";



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
						db.User.find({ where: { id: req.token, user_type: "Admin" } })
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
}

const controller = new AuthController();
export default controller;
