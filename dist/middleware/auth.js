"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AuthController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthController = exports.AuthController = function () {
    function AuthController() {
        _classCallCheck(this, AuthController);
    }

    _createClass(AuthController, [{
        key: "requiresLogin",


        // middleware for logged in users
        value: function requiresLogin(req, res, next) {
            var token = req.param("accessToken");
            if (token) {
                _jsonwebtoken2.default.verify(token, "secret_key", function (err, docs) {
                    if (err) {
                        next(res.status(401).send({ error: "Invalid Token" }));
                    } else {
                        var endTime = (0, _moment2.default)().unix();
                        var loginTime = docs.exp;
                        if (loginTime > endTime) {
                            req.token = docs.token;
                            _db2.default.User.findById(req.token).then(function (user) {
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
    }, {
        key: "requiresAdmin",
        value: function requiresAdmin(req, res, next) {
            var token = req.param("accessToken");
            if (token) {
                _jsonwebtoken2.default.verify(token, "secret_key", function (err, docs) {
                    if (err) {
                        next(res.status(401).send({ message: "Invalid Token" }));
                    } else {
                        var endTime = (0, _moment2.default)().unix();
                        var loginTime = docs.exp;
                        if (loginTime > endTime) {
                            req.token = docs.token;
                            _db2.default.User.find({ where: { id: req.token, user_type: (0, _constant2.default)().userType.admin } }).then(function (admin) {
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
    }, {
        key: "requiresAdminOrHr",
        value: function requiresAdminOrHr(req, res, next) {
            var token = req.param("accessToken");
            if (token) {
                _jsonwebtoken2.default.verify(token, "secret_key", function (err, docs) {
                    if (err) {
                        next(res.status(401).send({ message: "Invalid Token" }));
                    } else {
                        var endTime = (0, _moment2.default)().unix();
                        var loginTime = docs.exp;
                        if (loginTime > endTime) {
                            req.token = docs.token;

                            _db2.default.User.find({
                                where: {
                                    id: req.token,
                                    $or: [{ user_type: (0, _constant2.default)().userType.admin }, { user_type: (0, _constant2.default)().userType.hr }]
                                }
                            }).then(function (user) {
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

    }, {
        key: "verifyToken",
        value: function verifyToken(req, res, next) {
            var token = req.param("accessToken");
            if (token) {
                _jsonwebtoken2.default.verify(req.param("accessToken"), "secret_key", function (err) {
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
    }]);

    return AuthController;
}();

var controller = new AuthController();
exports.default = controller;
//# sourceMappingURL=auth.js.map