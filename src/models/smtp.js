import _ from 'lodash';
import mail from "../modules/mail";
import constant from "../models/constant";
import emailExistence from "email-existence";
import config from "../config";

export default function(sequelize, DataTypes) {
    const smtp = sequelize.define("SMTP", {
        email: {
            type: DataTypes.STRING(255),
            unique: false,
        },
        username: DataTypes.STRING(255),
        password: DataTypes.STRING,
        smtp_server: DataTypes.STRING,
        server_port: DataTypes.INTEGER,
        type: {
            type: DataTypes.ENUM,
            values: ["SSL", "TLS"],
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        hooks: {
            beforeCreate: function(SMTP) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { email: SMTP.email } })
                        .then((email) => {
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
            changeStatus(email) {
                return new Promise((resolve, reject) => {
                    this.update({ status: 1 }, { where: { email: email } })
                        .then((data) => {
                            if (data[0]) {
                                this.update({ status: 0 }, { where: { $not: { email: email } } })
                                    .then((data) => {
                                        resolve({ message: "Status Changed Successfully" })
                                    })
                                    .catch((error) => { reject("error") })
                            } else {
                                reject("Email not found");
                            }
                        })
                })
            },

            testSmtp(email) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { status: true } })
                        .then((data) => {
                            if (data) {
                                if (data.status == true) {
                                    if (config.is_silent == false) {
                                        resolve({ is_silent: true })
                                    } else {
                                        mail.sendMail(email, constant().smtp.subject, constant().smtp.text, data, constant().smtp.html)
                                            .then((response) => { resolve(response) })
                                            .catch((error) => { reject(error) });
                                    }
                                } else {
                                    reject("Email Is Not Active , Active And Try Again...");
                                }
                            } else {
                                reject("Email Not Found");
                            }

                        })
                        .catch((error) => { reject(error) });
                })
            }
        }
    });
    return smtp;
}