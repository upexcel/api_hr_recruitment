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
    db.Tag.findOne({ where: { type: "Default", title: "Shortlist" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Shortlist", type: "Default", color: "#cb891b", default_id: 2 });
            }
        });

    db.Tag.findOne({ where: { type: "Default", title: "Reject" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Reject", type: "Default", color: "#ef2e46", default_id: 6 });
            }
        });

    db.Tag.findOne({ where: { type: "Default", title: "Schedule_first_round" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Schedule_first_round", type: "Default", color: "#ba21d3", default_id: 3 });
            }
        });
    db.Tag.findOne({ where: { type: "Default", title: "Schedule_second_round" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Schedule_second_round", type: "Default", color: "#ba21d3", default_id: 4 });
            }
        });
    db.Tag.findOne({ where: { type: "Default", title: "Schedule_third_round" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Schedule_third_round", type: "Default", color: "#ba21d3", default_id: 5 });
            }
        });
    db.Tag.findOne({ where: { type: "Default", title: "Genuine Applicant" } })
        .then((id) => {
            if (!id) {
                db.Tag.create({ title: "Genuine Applicant", type: "Default", color: "#cb891b", default_id: 1 });
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
    db.SystemVariable.findOne({ where: { variableCode: "#tag_name" } })
        .then((id) => {
            if (!id) {
                db.SystemVariable.create({ variableCode: "#tag_name" });
            }
        });
});

export default Object.assign({}, db, {
    sequelize,
    Sequelize
});