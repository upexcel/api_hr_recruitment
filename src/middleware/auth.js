import moment from "moment";
import jwt from "jsonwebtoken";
import db from "../db";
import tag from "../models/constant";

export class AuthController {

    // middleware for logged in users
    requiresLogin(req, res, next) {
        const token = req.param("accessToken");
        if (token) {
            jwt.verify(token, "secret_key", (err, docs) => {
                if (err) {
                    next(res.status(401).send({ error: "Invalid Token" }));
                } else {
                    const endTime = moment().unix();
                    const loginTime = docs.exp;
                    if (loginTime > endTime) {
                        req.token = docs.token;
                        db.User.findById(req.token)
                            .then((user) => {
                                if (user) {
                                    req.user = user;
                                    next();
                                } else {
                                    next(res.status(400).send({ message: "Invalid User Token" }));
                                }
                            });
                    }
                }
            });
        } else {
            next(res.status(400).send({ message: "User is not logged in" }));
        }
    }

    requiresAdmin(req, res, next) {
        const token = req.param("accessToken");
        if (token) {
            jwt.verify(token, "secret_key", (err, docs) => {
                if (err) {
                    next(res.status(401).send({ message: "Invalid Token" }));
                } else {
                    const endTime = moment().unix();
                    const loginTime = docs.exp;
                    if (loginTime > endTime) {
                        req.token = docs.token;
                        db.User.find({ where: { id: req.token, user_type: tag().userType.admin } })
                            .then((admin) => {
                                if (admin) {
                                    req.user = admin;
                                    next();
                                } else {
                                    next(res.status(400).send({ message: "You Are Not Authorized" }));
                                }
                            });
                    }
                }
            });
        } else {
            next(res.status(400).send({ message: "User is not logged in" }));
        }
    }

    requiresAdminOrHr(req, res, next) {
            const token = req.param("accessToken");
            if (token) {
                jwt.verify(token, "secret_key", (err, docs) => {
                    if (err) {
                        next(res.status(401).send({ message: "Invalid Token" }));
                    } else {
                        const endTime = moment().unix();
                        const loginTime = docs.exp;
                        if (loginTime > endTime) {
                            req.token = docs.token;

                            db.User.find({
                                    where: {
                                        id: req.token,
                                        $or: [{ user_type: tag().userType.admin }, { user_type: tag().userType.hr }]
                                    }
                                })
                                .then((user) => {
                                    if (user) {
                                        req.user = user;
                                        next();
                                    } else {
                                        next(res.status(400).send({
                                            message: "You Are Not Authorized"
                                        }));
                                    }
                                });
                        }
                    }
                });
            } else {
                next(res.status(400).send({ message: "User is not logged in" }));

            }
        }
        // verify token
    verifyToken(req, res, next) {
        var token = req.param("accessToken");
        if (token) {
            jwt.verify(req.param("accessToken"), "secret_key", function(err) {
                if (err) {
                    next(res.status(400).send({ status: false }));
                } else {
                    res.json({ status: true });
                }
            });
        } else {
            next(res.status(400).send({ message: "Token Not Found" }));
        }

    }
}

const controller = new AuthController();
export default controller;
