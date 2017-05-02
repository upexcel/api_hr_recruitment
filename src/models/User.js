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
    });
    return User;
}