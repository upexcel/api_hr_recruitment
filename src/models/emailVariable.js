export default function(sequelize, DataTypes) {
    const Variable = sequelize.define("UserVariable", {
        variableCode: DataTypes.STRING,
        variableValue: DataTypes.TEXT('long'),
    }, {
        timestamps: true,
        freezeTableName: true,
    });
    return Variable;
}