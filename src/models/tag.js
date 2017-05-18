export default function(sequelize, DataTypes) {
	const Tag = sequelize.define("TAG", {
		email: {
			type: DataTypes.STRING,
			unique: true,
		},
		title: DataTypes.STRING,
		color: DataTypes.STRING,
		subject: DataTypes.STRING,
		type: {
			type: DataTypes.ENUM,
			values: ["Default", "Manual", "Automatic"],
		},
		to: DataTypes.DATE,
		from: DataTypes.DATE,
	}, {
		timestamps: true,
		freezeTableName: true,
		allowNull: true,

		classMethods: {

            // login.....
			tag(tag_id) {
				return new Promise((resolve, reject) => {
					this.find({
						where: {
							id: tag_id
						}
					})
                        .then((details) => {
	if (details) {
		resolve({
			status: 1
		});
	} else {
		reject("Invalid tag_id");
	}
});
				});
			}
		}
	});

	return Tag;
}
