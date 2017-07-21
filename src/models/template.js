export default function(sequelize, DataTypes) {
    const Template = sequelize.define("TEMPLATE", {
        templateName: DataTypes.STRING,
        subject: DataTypes.STRING,
        body: DataTypes.TEXT('long'),
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,

        associate: (models) => {
            Template.hasOne(models.Tag, { foreignKey: 'template_id' })
        }
    });
    return Template;
}