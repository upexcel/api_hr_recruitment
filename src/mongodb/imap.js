var Sequelize = require("sequelize");
var sequelize = new Sequelize("hr_system", "root", "java@123");

// the middleware function
var imap_server = sequelize.define("IMAP", {
	email: { type: Sequelize.STRING, unique: true },
	password: { type: Sequelize.STRING },
	imap_server: { type: Sequelize.STRING },
	server_port: { type: Sequelize.INTEGER },
	type: { type: Sequelize.ENUM, values: ["SSL", "TLS"] },
	status: { type: Sequelize.ENUM, values: ["TRUE", "FALSE"] },
	active: { type: Sequelize.ENUM, values: ["TRUE", "FALSE"], defaultValue: "FALSE" }
},{
	freezeTableName: true,
});
module.exports = imap_server;
