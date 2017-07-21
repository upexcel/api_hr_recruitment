export default function(sequelize, DataTypes) {
    const Variable = sequelize.define("SystemVariable", {
        variableCode: DataTypes.STRING('long')
    }, {
        timestamps: true,
        freezeTableName: true,
    });

    return Variable;
}