export default function(sequelize, DataTypes) {
	const Tag = sequelize.define("TAG", {
		email: {
			type: DataTypes.STRING,
			unique: true
		},
		title: DataTypes.STRING,
		color: DataTypes.STRING,
		subject: DataTypes.STRING,
		type: {
			type: DataTypes.ENUM,
			values: ["Default", "Manual", "Automatic"]
		},
		to: DataTypes.DATE,
		from: DataTypes.DATE
	}, {
		timestamps: true,
		freezeTableName: true,
		allowNull: true,
	});


	return Tag;
}
