export default function(sequelize, DataTypes) {
    const Variable = sequelize.define("SystemVariable", {
        variableCode: DataTypes.STRING
    }, {
        timestamps: true,
        freezeTableName: true,
    });

    return Variable;
}