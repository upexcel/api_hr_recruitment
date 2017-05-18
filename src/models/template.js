export default function(sequelize, DataTypes) {
	const Template = sequelize.define("TEMPLATE", {
		templateName: DataTypes.STRING,
		subject: DataTypes.STRING,
		body: DataTypes.STRING,
	}, {
		timestamps: true,
		freezeTableName: true,
	});
	return Template;
}
