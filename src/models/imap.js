import jwt from 'jsonwebtoken';

export default function(sequelize, DataTypes) {
    const imap = sequelize.define('IMAP', {
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        smtp_server: DataTypes.STRING,
        server_port: DataTypes.INTEGER,
        type: {
            type: DataTypes.ENUM,
            values: ['SSL', 'TLS']
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {

            // login.....
            save(imap) {
                return new Promise((resolve, reject) => {
                    this.find({ where: { email: imap.email } })
                        .then((details) => {
                            if (details) {
                                reject("Email Already Exists")
                            } else {
                                this.create(imap)
                                    .then((result) => {
                                        resolve(result)
                                    })
                                    .catch((error) => {
                                        reject(error)
                                    })
                            }
                        })
                });
            },

        }
    });
    return imap;
}
