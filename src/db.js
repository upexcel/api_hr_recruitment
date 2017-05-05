import Sequelize from "sequelize";
import models from "./models";
import config from "./config";
import chalk from "chalk";
const db = {};

// create your instance of sequelize
const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password);

// load modelsa
Object.keys(models).forEach((modelName) => {
	const model = models[modelName](sequelize, Sequelize.DataTypes);
	db[modelName] = model;
	console.log(`Loading model - ${modelName}`);
});


// invoke associations on each of the models
Object.keys(db).forEach((modelName) => {
	if (db[modelName].options.associate) {
		db[modelName].options.associate(db);
	}
});


sequelize.sync().then(() => {

});

export default Object.assign({}, db, {
	sequelize,
	Sequelize,
});
