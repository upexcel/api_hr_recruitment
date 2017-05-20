export default function(sequelize, DataTypes) {
	const Variable = sequelize.define("UserVariable", {
		variableCode: DataTypes.STRING,
		variableValue: DataTypes.STRING,
	}, {
		timestamps: true,
		freezeTableName: true,
	});
	return Variable;
}
