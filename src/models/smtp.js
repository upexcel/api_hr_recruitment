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
            smtpTest(email) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { email: email } })
                        .then((data) => {
                            if (data) {
                                sequelize.query(`UPDATE SMTP  SET status = (case when email = "${email}" then 1 else 0 end);`)
                                    .then(function(users) {
                                        resolve({ status: 1, message: "success", data: "status changed successfully" });
                                    });
                            } else {
                                reject("Email not found");
                            }
                        })
                })
            },
        }
    });
    return smtp;
}
