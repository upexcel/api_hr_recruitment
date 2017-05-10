import Sequelize from "sequelize";
import models from "./models";
import config from "./config";
const db = {};

// create your instance of sequelize
const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password);

// load modelsa
Object.keys(models).forEach((modelName) => {
	const model = models[modelName](sequelize, Sequelize.DataTypes);
	db[modelName] = model;
	// console.log(`Loading model - ${modelName}`);
});


// invoke associations on each of the models
Object.keys(db).forEach((modelName) => {
	if (db[modelName].options.associate) {
		db[modelName].options.associate(db);
	}
});


sequelize.sync().then(() => {
	db.Tag.findOne({ where: { type: "Default" ,title: "Reject"} })
    .then((id) => {
	if (!id) {
		db.Tag.create({ title: "Reject", type: "Default" , color:"CB891B"});
	}
});

	db.Tag.findOne({ where: { type: "Default", title: "Ignore" } })
    .then((id) => {
	if (!id) {
		db.Tag.create({ title: "Ignore", type: "Default" , color:"EF2E46"});
	}
});

	db.Tag.findOne({ where: { type: "Default", title: "Schedule"} })
    .then((id) => {
	if (!id) {
		db.Tag.create({ title: "Schedule", type: "Default" , color:"BA21D3"});
	}
});
});

export default Object.assign({}, db, {
	sequelize,
	Sequelize,
});
