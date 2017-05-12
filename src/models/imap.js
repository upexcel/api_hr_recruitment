export default function (sequelize, DataTypes) {
	const imap = sequelize.define("IMAP", {
		email: {
			type: DataTypes.STRING,
			unique: true,
		},
		password: DataTypes.STRING,
		imap_server: DataTypes.STRING,
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
		active: {
			type: DataTypes.ENUM,
			values: ["TRUE", "FALSE"],
			defaultValue: "FALSE",
		},
	}, {
		timestamps: true,
		freezeTableName: true,
		allowNull: true,
		hooks: {
			beforeCreate(IMAP) {
				return new Promise((resolve, reject) => {
					this.findOne({ where: { email: IMAP.email } })
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
	return imap;
}
