import jwt from "jsonwebtoken";
import generatePassword from "password-generator";
import constant from "../models/constant";
import mail from "../modules/mail";
import crypto from "crypto";
import db from "../db.js";
import * as _ from "lodash";

export default function(sequelize, DataTypes) {
    const User = sequelize.define("USER", {
        email: {
            type: DataTypes.STRING(255),
            unique: false,
        },
        password: DataTypes.STRING,
        user_type: {
            type: DataTypes.ENUM,
            values: ["Admin", "Guest", "HR"]
        }
    }, {
        hooks: {
            beforeCreate: function(USER, options) {
                return new Promise((resolve, reject) => {
                    this.findOne({
                            where: {
                                email: USER.email
                            }
                        })
                        .then((user) => {
                            if (user) {
                                throw new Error(reject("Email Already In Use"));
                            } else {
                                resolve()
                            }
                        })
                })

            }
        },
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {

            // login.....
            login(user) {
                return new Promise((resolve, reject) => {
                    this.find({
                            where: {
                                email: user.email,
                                password: user.password
                            }
                        })
                        .then((details) => {
                            if (details) {
                                let expiredIn = 0;
                                if (user.remember_me) {
                                    expiredIn = 24 * 60 * 60;
                                } else {
                                    expiredIn = 60 * 60;
                                }
                                const token = jwt.sign({
                                    token: details.id,
                                }, "secret_key", {
                                    expiresIn: expiredIn,
                                });
                                resolve({
                                    status: 1,
                                    token
                                });
                            } else {
                                reject("Invalid Login Details");
                            }
                        });
                });
            },
            forgotPassword(email) {
                return new Promise((resolve, reject) => {
                    var new_password = generatePassword();
                    var new_pass = crypto.createHash("sha256").update(new_password).digest("base64");
                    this.update({ password: new_pass }, { where: { email: email } })
                        .then((docs) => {
                            db.Smtp.findOne({ where: { status: true } })
                                .then((smtp_data) => {
                                    if (docs && docs[0]) {
                                        new_password = `your new password is : ${new_password}`;
                                        mail.sendMail(email, constant().smtp.passwordMessage, constant().smtp.text, smtp_data, new_password)
                                            .then((response) => {
                                                resolve({ message: "If email exists, new password will be send to your email !!" })
                                            }).catch((error) => { reject(error) });
                                    } else {
                                        reject("update failed");
                                    }
                                })
                        }, (err) => { reject(err) })
                })
            },
            userFindAll(page, limit) {
                return new Promise((resolve, reject) => {
                    this.findAll({
                            offset: (page - 1) * parseInt(limit),
                            limit: parseInt(limit),
                            order: '`id` DESC'
                        })
                        .then((data) => {
                            resolve(data)
                        }, (err) => { reject({ error: 1, message: err, data: [] }) })
                })
            },
            userDelete(id) {
                return new Promise((resolve, reject) => {
                    this.destroy({ where: { id: id } })
                        .then((response) => {
                            resolve(response)
                        })
                        .catch((err) => { reject({ error: 1, messgae: "User Not Found" }) })
                })
            },
            logs(user_activity) {
                return new Promise((resolve, reject) => {
                    user_activity.find().exec()
                        .then((data) => {
                            if(!data.length){
                                resolve()
                            }
                            _.forEach(data, (val, key) => {
                                val.get('action').reverse()
                                val.get('json').reverse()
                                val.get('time').reverse()
                                if (key == data.length - 1) {
                                    resolve(data)
                                }
                            })
                        })
                });
            }
        },
    });
    return User;
}