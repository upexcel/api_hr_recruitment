"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var smtp = sequelize.define("SMTP", {
        email: {
            type: DataTypes.STRING(255),
            unique: false
        },
        username: DataTypes.STRING(255),
        password: DataTypes.STRING,
        smtp_server: DataTypes.STRING,
        server_port: DataTypes.INTEGER,
        type: {
            type: DataTypes.ENUM,
            values: ["SSL", "TLS"]
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        hooks: {
            beforeCreate: function beforeCreate(SMTP) {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    _this.findOne({ where: { email: SMTP.email } }).then(function (email) {
                        if (email) {
                            reject("Email Already In Use");
                        } else {
                            resolve();
                        }
                    });
                });
            }
        },
        classMethods: {
            changeStatus: function changeStatus(email) {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    _this2.update({ status: 1 }, { where: { email: email } }).then(function (data) {
                        if (data[0]) {
                            _this2.update({ status: 0 }, { where: { $not: { email: email } } }).then(function (data) {
                                resolve({ message: "Status Changed Successfully" });
                            }).catch(function (error) {
                                reject("error");
                            });
                        } else {
                            reject("Email not found");
                        }
                    });
                });
            },
            testSmtp: function testSmtp(email) {
                var _this3 = this;

                return new Promise(function (resolve, reject) {
                    _this3.findOne({ where: { status: true } }).then(function (data) {
                        if (data) {
                            if (data.status == true) {
                                if (_config2.default.is_silent == false) {
                                    resolve({ is_silent: true });
                                } else {
                                    _mail2.default.sendMail(email, (0, _constant2.default)().smtp.subject, (0, _constant2.default)().smtp.text, data, (0, _constant2.default)().smtp.html).then(function (response) {
                                        resolve(response);
                                    }).catch(function (error) {
                                        reject(error);
                                    });
                                }
                            } else {
                                reject("Email Is Not Active , Active And Try Again...");
                            }
                        } else {
                            reject("Email Not Found");
                        }
                    }).catch(function (error) {
                        reject(error);
                    });
                });
            }
        }
    });
    return smtp;
};

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _mail = require("../modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _emailExistence = require("email-existence");

var _emailExistence2 = _interopRequireDefault(_emailExistence);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=smtp.js.map