import imap_connection from "../service/imap";
import Imap from "imap";
import moment from "moment";
export default function(sequelize, DataTypes) {
    const imap = sequelize.define("IMAP", {
        email: {
            type: DataTypes.STRING(255),
            unique: false,
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
            defaultValue: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        total_emails: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        last_fetched_time: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false
        },
        days_left_to_fetched:{
            type:DataTypes.INTEGER,
            allowNull:true
        },
        fetched_date_till:{
            type:DataTypes.DATE,
            allowNull:true
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        hooks: {
            beforeCreate: function(IMAP) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { email: IMAP.email } })
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

            // imap test.....
            imapTest(email) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { email: email } })
                        .then((result) => {
                            if (result && result.active == false) {
                                const imap = new Imap({
                                    user: result.email,
                                    password: result.password,
                                    host: result.imap_server,
                                    port: result.server_port,
                                    tls: result.type
                                });
                                imap_connection.imapConnection(imap)
                                    .then((response) => {
                                        if (response) {
                                            this.update({ active: true }, { where: { email: result.email } })
                                                .then((data) => {
                                                    if (data[0] == 1) {
                                                        resolve({ message: "Imap Activated Successfully" });
                                                    } else if (data[0] == 0) {
                                                        reject(new Error("User Not Found In Database"));
                                                    } else {
                                                        reject(new Error("error"));
                                                    }
                                                })
                                        } else {
                                            reject(new Error("error"));
                                        }
                                    })
                                    .catch((error) => { reject("Invalid Details Can Not Activated") });
                            } else if (result && result.active == true) {
                                this.update({ active: false }, { where: { email: result.email } })
                                    .then((data) => {
                                        if (data[0] == 1) {
                                            resolve({ message: "Imap Inactivated Successfully" });
                                        } else if (data[0] == 0) {
                                            reject(new Error("User Not Found In Database"));
                                        } else {
                                            reject(new Error("error"));
                                        }
                                    })
                            } else {
                                if (!result) {
                                    reject(new Error("EmailId Not found"));
                                } else {
                                    resolve({ message: "Email Already set to True" })
                                }

                            }
                        })
                })
            },

            getCounts(tag, dataValues) {
                return new Promise((resolve, reject) => {
                    imap_connection.imapCredential(tag)
                        .then((imap) => {
                            imap_connection.imapConnection(imap)
                                .then((connection) => {
                                    var date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
                                    var stillUtc = moment.utc(date).toDate();
                                    var local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
                                    imap.search(["ALL", ["BEFORE", local]], function(err, results) {
                                        dataValues.total_emails = results.length;
                                        resolve(dataValues)
                                    })
                                }, (err) => {
                                    reject(err)
                                })

                        })
                })
            }
        },

    });
    return imap;
}