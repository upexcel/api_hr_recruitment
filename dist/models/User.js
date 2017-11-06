"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var User = sequelize.define("USER", {
        email: {
            type: DataTypes.STRING(255),
            unique: false
        },
        password: DataTypes.STRING,
        user_type: {
            type: DataTypes.ENUM,
            values: ["Admin", "Guest", "HR"]
        }
    }, {
        hooks: {
            beforeCreate: function beforeCreate(USER, options) {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    _this.findOne({
                        where: {
                            email: USER.email
                        }
                    }).then(function (user) {
                        if (user) {
                            throw new Error(reject("Email Already In Use"));
                        } else {
                            resolve();
                        }
                    });
                });
            }
        },
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {

            // login.....
            login: function login(user) {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    _this2.find({
                        where: {
                            email: user.email,
                            password: user.password
                        }
                    }).then(function (details) {
                        if (details) {
                            var expiredIn = 0;
                            if (user.remember_me) {
                                expiredIn = 24 * 60 * 60 * 365;
                            } else {
                                expiredIn = 60 * 60;
                            }
                            var token = _jsonwebtoken2.default.sign({
                                token: details.id
                            }, "secret_key", {
                                expiresIn: expiredIn
                            });
                            resolve({
                                status: 1,
                                token: token,
                                role: details.user_type
                            });
                        } else {
                            reject("Invalid Login Details");
                        }
                    });
                });
            },
            forgotPassword: function forgotPassword(email) {
                var _this3 = this;

                return new Promise(function (resolve, reject) {
                    var new_password = (0, _passwordGenerator2.default)();
                    var new_pass = _crypto2.default.createHash("sha256").update(new_password).digest("base64");
                    _this3.update({ password: new_pass }, { where: { email: email } }).then(function (docs) {
                        _db2.default.Smtp.findOne({ where: { status: true } }).then(function (smtp_data) {
                            if (docs && docs[0]) {
                                new_password = "your new password is : " + new_password;
                                _mail2.default.sendMail(email, (0, _constant2.default)().smtp.passwordMessage, (0, _constant2.default)().smtp.text, smtp_data, new_password).then(function (response) {
                                    resolve({ message: "If email exists, new password will be send to your email !!" });
                                }).catch(function (error) {
                                    reject(error);
                                });
                            } else {
                                reject("update failed");
                            }
                        });
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            userFindAll: function userFindAll(user, page, limit) {
                var _this4 = this;

                return new Promise(function (resolve, reject) {
                    _this4.findAll({
                        where: { id: { $ne: user.id } },
                        offset: (page - 1) * parseInt(limit),
                        limit: parseInt(limit),
                        order: '`id` DESC'
                    }).then(function (data) {
                        resolve(data);
                    }, function (err) {
                        reject({ error: 1, message: err, data: [] });
                    });
                });
            },
            userDelete: function userDelete(user, id) {
                var _this5 = this;

                return new Promise(function (resolve, reject) {
                    _this5.destroy({ where: { id: id, $and: { id: { "$ne": user.id } } } }).then(function (response) {
                        resolve(response);
                    }).catch(function (err) {
                        reject({ error: 1, messgae: "User Not Found" });
                    });
                });
            },
            logs: function logs(user_activity, email) {
                return new Promise(function (resolve, reject) {
                    user_activity.findOne({ email: email }).exec().then(function (data) {
                        data.get('action').reverse();
                        data.get('time').reverse();
                        data.get('json').reverse();
                        resolve([data]);
                    });
                });
            }
        }
    });
    return User;
};

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _passwordGenerator = require("password-generator");

var _passwordGenerator2 = _interopRequireDefault(_passwordGenerator);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _mail = require("../modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _db = require("../db.js");

var _db2 = _interopRequireDefault(_db);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=User.js.map