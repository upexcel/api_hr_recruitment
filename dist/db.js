"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _sequelize = require("sequelize");

var _sequelize2 = _interopRequireDefault(_sequelize);

var _models = require("./models");

var _models2 = _interopRequireDefault(_models);

var _constant = require("./models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _index = require("../migrations/index.js");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = {};

// create your instance of sequelize
var sequelize = new _sequelize2.default(_config2.default.db.name, _config2.default.db.username, _config2.default.db.password, { port: 3306, host: _config2.default.db.host });

// load models
Object.keys(_models2.default).forEach(function (modelName) {
    var model = _models2.default[modelName](sequelize, _sequelize2.default.DataTypes);
    db[modelName] = model;
});

// invoke associations on each of the models
Object.keys(db).forEach(function (modelName) {
    if (db[modelName].options.associate) {
        db[modelName].options.associate(db);
    }
});

sequelize.sync().then(function () {
    db.Tag.findOne({ where: { type: (0, _constant2.default)().tagType.default, title: "Shortlist" } }).then(function (id) {
        if (!id) {
            db.Tag.create({ title: "Shortlist", type: (0, _constant2.default)().tagType.default, color: "#cb891b", default_id: 2 });
        }
    });

    db.Tag.findOne({ where: { type: (0, _constant2.default)().tagType.default, title: "Reject" } }).then(function (id) {
        if (!id) {
            db.Tag.create({ title: "Reject", type: (0, _constant2.default)().tagType.default, color: "#ef2e46", default_id: 6 });
        }
    });

    db.Tag.findOne({ where: { type: (0, _constant2.default)().tagType.default, title: "First Round" } }).then(function (id) {
        if (!id) {
            db.Tag.create({ title: "First Round", type: (0, _constant2.default)().tagType.default, color: "#ba21d3", default_id: 3 });
        }
    });
    db.Tag.findOne({ where: { type: (0, _constant2.default)().tagType.default, title: "Second Round" } }).then(function (id) {
        if (!id) {
            db.Tag.create({ title: "Second Round", type: (0, _constant2.default)().tagType.default, color: "#ba21d3", default_id: 4 });
        }
    });
    db.Tag.findOne({ where: { type: (0, _constant2.default)().tagType.default, title: "Third Round" } }).then(function (id) {
        if (!id) {
            db.Tag.create({ title: "Third Round", type: (0, _constant2.default)().tagType.default, color: "#ba21d3", default_id: 5 });
        }
    });
    db.Tag.findOne({ where: { type: (0, _constant2.default)().tagType.default, title: "Genuine Applicant" } }).then(function (id) {
        if (!id) {
            db.Tag.create({ title: "Genuine Applicant", type: (0, _constant2.default)().tagType.default, color: "#cb891b", default_id: 1 });
        }
    });

    db.Tag.findOne({ where: { type: (0, _constant2.default)().tagType.default, title: "Selected" } }).then(function (id) {
        if (!id) {
            db.Tag.create({ title: "Selected", type: (0, _constant2.default)().tagType.default, color: "#ef2f50", default_id: 7 });
        }
    });
    db.SystemVariable.findOne({ where: { variableCode: "#date" } }).then(function (id) {
        if (!id) {
            db.SystemVariable.create({ variableCode: "#date" });
        }
    });

    db.SystemVariable.findOne({ where: { variableCode: "#candidate_name" } }).then(function (id) {
        if (!id) {
            db.SystemVariable.create({ variableCode: "#candidate_name" });
        }
    });

    db.SystemVariable.findOne({ where: { variableCode: "#page_break" } }).then(function (id) {
        if (!id) {
            db.SystemVariable.create({ variableCode: "#page_break" });
        }
    });
    db.SystemVariable.findOne({ where: { variableCode: "#logo" } }).then(function (id) {
        if (!id) {
            db.SystemVariable.create({ variableCode: "#logo" });
        }
    });
    db.SystemVariable.findOne({ where: { variableCode: "#scheduled_date" } }).then(function (id) {
        if (!id) {
            db.SystemVariable.create({ variableCode: "#scheduled_date" });
        }
    });
    db.SystemVariable.findOne({ where: { variableCode: "#scheduled_time" } }).then(function (id) {
        if (!id) {
            db.SystemVariable.create({ variableCode: "#scheduled_time" });
        }
    });
    db.SystemVariable.findOne({ where: { variableCode: "#tag_name" } }).then(function (id) {
        if (!id) {
            db.SystemVariable.create({ variableCode: "#tag_name" });
        }
    });
}, function (err) {
    console.log(err);
    console.log("Incorrect Sequelize Db Details Update config details");
    process.exit(0);
});

exports.default = Object.assign({}, db, {
    sequelize: sequelize,
    Sequelize: _sequelize2.default
});
//# sourceMappingURL=db.js.map