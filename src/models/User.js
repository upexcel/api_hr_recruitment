import jwt from 'jsonwebtoken';

export default function(sequelize, DataTypes) {
    const User = sequelize.define('USER', {
        user_name: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        user_type: {
            type: DataTypes.ENUM,
            values: ['ADMIN', 'USER'],
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {

            // login.....
            login (user) {
                return new Promise((resolve, reject) => {
                    this.find({where: { email : user.email, password : user.password } } )
                        .then((details) =>{
                            if(details) {
                                let token = jwt.sign({
                                    token: details.id
                                }, "secret_key", {
                                    expiresIn: 60 * 60
                                });
                                resolve({ token: token})
                            }else{
                               reject("Invalid Login Details");
                            }
                        })
                });
            },

        }
    });
    return User;
}