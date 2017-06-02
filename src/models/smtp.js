import _ from 'lodash';
import mail from "../modules/mail";
import constant from "../models/constant";
export default function(sequelize, DataTypes) {
    const smtp = sequelize.define("SMTP", {
        email: {
            type: DataTypes.STRING,
            unique: true,
        },
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
                                        if (data[0]) {
                                            resolve({ message: "Status Changed Successfully" })
                                        } else {
                                            reject("error")
                                        }
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
                    this.findOne({ where: { email: email } })
                        .then((data) => {
                            if (data) {
                                if (data.dataValues.status == true) {
                                    mail.sendMail(email, constant().smtp.subject, constant().smtp.text, constant().smtp.from, constant().smtp.html)
                                        .then((response) => { resolve(response) })
                                        .catch((error) => { reject(error) });
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
