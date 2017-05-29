import _ from 'lodash';
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
            type: DataTypes.ENUM,
            values: ["TRUE", "FALSE"],
            defaultValue: "FALSE",
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
            smtpTest(email) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { email: email } })
                        .then((data) => {
                            if (data) {
                                this.findAll({})
                                    .then((data) => {
                                        _.map(data, (val, key) => {
                                            if (val.email == email) {
                                                this.update({ status: "TRUE" }, { where: { email: email } })
                                                    .then(() => {})
                                                    .catch((error) => { reject(error) })
                                            } else {
                                                this.update({ status: "FALSE" }, { where: { email: val.email } })
                                                    .then(() => {})
                                                    .catch((error) => { reject(error) });
                                            }
                                            if (key == (_.size(data) - 1)) {
                                                resolve({
                                                    status: 1,
                                                    message: "success",
                                                    data: "status changed successfully"
                                                });
                                            }
                                        });
                                    })
                                    .catch((error) => { reject(error) });
                            } else {
                                reject(new Error("email id is not found in database"));
                            }
                        })
                        .catch((error) => { reject(error) });
                })
            },
        }
    });
    return smtp;
}
