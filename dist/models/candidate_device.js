"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var Candidate_device = sequelize.define("CANDIDATE_DEVICE", {
        email_id: DataTypes.STRING,
        device_id: DataTypes.STRING,
        token: DataTypes.STRING
    }, {
        hooks: {
            beforeCreate: function beforeCreate(CANDIDATE_DEVICE) {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    _this.findOne({ where: { "$or": [{ email_id: CANDIDATE_DEVICE.email_id }, { device_id: CANDIDATE_DEVICE.device_id }] } }).then(function (email) {
                        if (email) {
                            reject("depuplicate device information");
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
            createDevice: function createDevice(body) {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    _this2.findOne({ where: { email_id: body.email_id } }).then(function (device) {
                        if (device) {
                            _this2.update(body, { where: { email_id: body.email_id } }).then(function (response) {
                                resolve(response);
                            });
                        } else {
                            _this2.create(body).then(function (data) {
                                resolve(data);
                            });
                        }
                    });
                });
            },
            logout: function logout(email_id, device_id) {
                var _this3 = this;

                return new Promise(function (resolve, reject) {
                    _this3.update({ token: null, device_id: null }, { where: { email_id: email_id, device_id: device_id } }).then(function (response) {
                        resolve(response);
                    }, function (err) {
                        reject(err);
                    });
                });
            }
        }
    });
    return Candidate_device;
};
//# sourceMappingURL=candidate_device.js.map