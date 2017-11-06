"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var Variable = sequelize.define("SystemVariable", {
        variableCode: DataTypes.STRING
    }, {
        timestamps: true,
        freezeTableName: true
    });

    return Variable;
};
//# sourceMappingURL=systemVariable.js.map