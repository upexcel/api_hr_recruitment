"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var imap = sequelize.define("IMAP", {
        email: {
            type: DataTypes.STRING(255),
            unique: false
        },
        password: DataTypes.STRING,
        imap_server: {
            type: DataTypes.STRING,
            defaultValue: "imap.gmail.com"
        },
        server_port: {
            type: DataTypes.INTEGER,
            defaultValue: 993
        },
        type: {
            type: DataTypes.ENUM,
            values: ["SSL", "TLS"],
            defaultValue: "TLS"
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        total_emails: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        last_fetched_time: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false
        },
        days_left_to_fetched: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        fetched_date_till: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        hooks: {
            beforeCreate: function beforeCreate(IMAP) {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    _this.findOne({ where: { email: IMAP.email } }).then(function (email) {
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

            // imap test.....
            imapTest: function imapTest(email) {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    _this2.findOne({ where: { email: email } }).then(function (result) {
                        if (result && result.active == false) {
                            var _imap = new _imap5.default({
                                user: result.email,
                                password: result.password,
                                host: result.imap_server,
                                port: result.server_port,
                                tls: result.type
                            });
                            _imap3.default.imapConnection(_imap).then(function (response) {
                                if (response) {
                                    _this2.update({ active: true }, { where: { email: result.email } }).then(function (data) {
                                        if (data[0] == 1) {
                                            resolve({ message: "Imap Activated Successfully" });
                                        } else if (data[0] == 0) {
                                            reject(new Error("User Not Found In Database"));
                                        } else {
                                            reject(new Error("error"));
                                        }
                                    });
                                } else {
                                    reject(new Error("error"));
                                }
                            }).catch(function (error) {
                                reject("Invalid Details Can Not Activated");
                            });
                        } else if (result && result.active == true) {
                            _this2.update({ active: false }, { where: { email: result.email } }).then(function (data) {
                                if (data[0] == 1) {
                                    resolve({ message: "Imap Inactivated Successfully" });
                                } else if (data[0] == 0) {
                                    reject(new Error("User Not Found In Database"));
                                } else {
                                    reject(new Error("error"));
                                }
                            });
                        } else {
                            if (!result) {
                                reject(new Error("EmailId Not found"));
                            } else {
                                resolve({ message: "Email Already set to True" });
                            }
                        }
                    });
                });
            },
            getCounts: function getCounts(tag, dataValues) {
                return new Promise(function (resolve, reject) {
                    _imap3.default.imapCredential(tag).then(function (imap) {
                        _imap3.default.imapConnection(imap).then(function (connection) {
                            var date = _moment2.default.utc().format('YYYY-MM-DD HH:mm:ss');
                            var stillUtc = _moment2.default.utc(date).toDate();
                            var local = (0, _moment2.default)(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
                            imap.search(["ALL", ["BEFORE", local]], function (err, results) {
                                dataValues.total_emails = results.length;
                                resolve(dataValues);
                            });
                        }, function (err) {
                            reject(err);
                        });
                    });
                });
            }
        }

    });
    return imap;
};

var _imap2 = require("../service/imap");

var _imap3 = _interopRequireDefault(_imap2);

var _imap4 = require("imap");

var _imap5 = _interopRequireDefault(_imap4);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=imap.js.map