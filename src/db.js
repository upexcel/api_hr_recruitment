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
});

// invoke associations on each of the models
Object.keys(db).forEach((modelName) => {
    if (db[modelName].options.associate) {
        db[modelName].options.associate(db);
    }
});

sequelize.sync().then(() => {
    db.Tag.findOne({ where: { type: "Default", title: "Reject" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Reject", type: "Default", color: "#cb891b" });
            }
        });

    db.Tag.findOne({ where: { type: "Default", title: "Ignore" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Ignore", type: "Default", color: "#ef2e46" });
            }
        });

    db.Tag.findOne({ where: { type: "Default", title: "Schedule" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Schedule", type: "Default", color: "#ba21d3" });
            }
        });

    db.SystemVariable.findOne({ where: { variableCode: "#date" } })
        .then((id) => {
            if (!id) {
                db.SystemVariable.create({ variableCode: "#date" });
            }
        });

    db.SystemVariable.findOne({ where: { variableCode: "#candidate_name" } })
        .then((id) => {
            if (!id) {
                db.SystemVariable.create({ variableCode: "#candidate_name" });
            }
        });

    db.SystemVariable.findOne({ where: { variableCode: "#page_break" } })
        .then((id) => {
            if (!id) {
                db.SystemVariable.create({ variableCode: "#page_break" });
            }
        });
    db.SystemVariable.findOne({ where: { variableCode: "#logo" } })
        .then((id) => {
            if (!id) {
                db.SystemVariable.create({ variableCode: "#logo" });
            }
        });
});

export default Object.assign({}, db, {
    sequelize,
    Sequelize
});
