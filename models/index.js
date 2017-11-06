var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var config = require("../../config.json");
var migration = require('../migrations/index.js')
var db = {};
var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, { host: config.db.host, port: 3306 });

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
    }).catch((err) => {
        console.log("Incorrect Sequelize Db Details update config file");
        process.exit(0)
    })

module.exports = db;