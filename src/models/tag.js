export default function(sequelize, DataTypes) {
	const Tag = sequelize.define("TAG", {
		email: {
			type: DataTypes.STRING,
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
		template_id:DataTypes.INTEGER,
	}, {
		timestamps: true,
		freezeTableName: true,
		allowNull: true,

		classMethods: {
            // login.....
			tag(tag_id) {   /*eslint-disable*/
				app.route("/tag/add/:type").post( tag.save);		return new Promise((resolve, reject) => {   /*eslint-enable*/
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
