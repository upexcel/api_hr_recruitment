import imap_connection from "../service/imapconnection";
import Imap from "imap"
export default function(sequelize, DataTypes) {
    const imap = sequelize.define("IMAP", {
        email: {
            type: DataTypes.STRING,
            unique: true,
        },
        password: DataTypes.STRING,
        imap_server: DataTypes.STRING,
        server_port: DataTypes.INTEGER,
        type: {
            type: DataTypes.ENUM,
            values: ["SSL", "TLS"],
        },
        status: {
            type: DataTypes.ENUM,
            values: ["TRUE", "FALSE"],
            defaultValue: "FALSE",
        },
        active: {
            type: DataTypes.ENUM,
            values: ["TRUE", "FALSE"],
            defaultValue: "FALSE",
        },
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

            // login.....
            imapTest(email) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { email: email } })
                        .then((result) => {
                            if (result && result.status == "FALSE") {
                                var imap = new Imap({
                                    user: result.email,
                                    password: result.password,
                                    host: result.imap_server,
                                    port: result.server_port,
                                    tls: result.type
                                });
                                imap_connection.imapConnection(imap, (err) => {
                                    if (err) {
                                        reject({ status: 0, message: "error", data: err });
                                    } else {
                                        this.update({ status: "TRUE" }, { where: { email: result.email } })
                                            .then((data) => {
                                                if (data[0] == 1) {
                                                    resolve({ message: "successfully Active changed to true" });
                                                } else if (data[0] == 0) {
                                                    reject(new Error("user not found in database"));
                                                } else {
                                                    reject(new Error("error"));
                                                }
                                            })
                                    }
                                });
                            } else {
                                if (!result) {
                                    reject(new Error("email not found"));
                                } else {
                                    resolve({ message: "Email Already set to True" })
                                }

                            }
                        })
                })

                // function imap_connection(imap, callback) {
                //     function openInbox(cb) {
                //         imap.openBox("INBOX", true, cb);
                //     }
                //     imap.once("ready", function() {
                //         openInbox(function(err, box) {
                //             if (err) {
                //                 callback(err);
                //             } else {
                //                 callback("", box);
                //             }
                //             imap.end();
                //         });
                //     });
                //     imap.once("error", function(err) {
                //         callback(err);
                //     });
                //     imap.once("end", function() {
                //         console.log("Connection ended");
                //     });
                //     imap.connect();
                // }
            },
        },

    });
    return imap;
}
