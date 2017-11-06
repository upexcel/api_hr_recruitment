'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var Template = sequelize.define("TEMPLATE", {
        templateName: DataTypes.STRING,
        subject: DataTypes.STRING,
        body: DataTypes.TEXT('long')
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,

        associate: function associate(models) {
            Template.hasOne(models.Tag, { foreignKey: 'template_id' });
        }
    });
    return Template;
};
//# sourceMappingURL=template.js.map