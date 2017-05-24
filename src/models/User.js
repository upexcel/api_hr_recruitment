import jwt from "jsonwebtoken";

export default function(sequelize, DataTypes) {
    const User = sequelize.define("USER", {
        email: {
            type: DataTypes.STRING,
            unique: true,
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
                                reject("Email Already In Use");
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
            }

        },
    });
    return User;
}
