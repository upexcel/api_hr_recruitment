import jwt from "jsonwebtoken";
import generatePassword from "password-generator";
import constant from "../models/constant";
import mail from "../modules/mail";
import crypto from "crypto";

export default function(sequelize, DataTypes) {
    const User = sequelize.define("USER", {
        email: {
            type: DataTypes.STRING,
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
                                const token = jwt.sign({
                                    token: details.id,
                                }, "secret_key", {
                                    expiresIn: 60 * 60,
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
                            if (docs && docs[0]) {
                                new_password = `your new password is : ${new_password}`;
                                mail.sendMail(email, constant().smtp.passwordMessage, constant().smtp.text, constant().smtp.from, new_password)
                                    .then((response) => {
                                        resolve({ message: "Password Updated. Check your email for new password." })
                                    }).catch((error) => { reject(error) });
                            } else {
                                reject("update failed");
                            }
                        }, (err) => { reject(err) })
                })
            }
        },
    });
    return User;
}