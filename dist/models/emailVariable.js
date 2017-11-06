"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var Variable = sequelize.define("UserVariable", {
        variableCode: DataTypes.STRING,
        variableValue: DataTypes.TEXT('long')
    }, {
        timestamps: true,
        freezeTableName: true
    });
    return Variable;
};
//# sourceMappingURL=emailVariable.js.map