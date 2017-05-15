export default function(sequelize, DataTypes) {
	const smtp = sequelize.define("SMTP", {
		email: {
			type: DataTypes.STRING,
			unique: true,
		},
		password: DataTypes.STRING,
		smtp_server: DataTypes.STRING,
		server_port: DataTypes.INTEGER,
		type: {
			type: DataTypes.ENUM,
			values: ["SSL", "TLS"],
		},
		status: {
			type: DataTypes.ENUM,
			values: ["TRUE", "FALSE"],
			defaultValue: "FALSE",
		},
	}, {
		timestamps: true,
		freezeTableName: true,
		allowNull: true,
		hooks: {
			beforeCreate(SMTP) {
				return new Promise((resolve, reject) => {
					this.findOne({ where: { email: SMTP.email } })
                        .then((email) => {
	if (email) {
		reject("Email Already In Use");
	} else {
		resolve();
	}
});
				});
			},
		},
	});
	return smtp;
}
