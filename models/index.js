var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var config = require("../../dev_config.json");
var migration = require('../migrations/index.js')
var db = {};
var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password);

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

migration.up(sequelize.getQueryInterface(), Sequelize)
    .then((response) => {
        migration.down(sequelize.getQueryInterface(), Sequelize)
            .then((data) => {
                db.sequelize = sequelize;
                db.Sequelize = Sequelize;
            })
    });

module.exports = db;