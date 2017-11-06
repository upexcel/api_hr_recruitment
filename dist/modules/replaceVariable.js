"use strict";

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var date = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear();

module.exports = {
    filter: function filter(body, name, tagId) {
        return new Promise(function (resolve, reject) {
            _db2.default.Tag.findOne({ where: { id: tagId } }).then(function (tag) {
                if (tag) {
                    _db2.default.Variable.findAll({}).then(function (data) {
                        _lodash2.default.forEach(data, function (val, key) {
                            function replaceAll(body, find, replace) {
                                return body.replace(new RegExp(find, 'gi'), replace);
                            }
                            body = replaceAll(body, val.variableCode, val.variableValue);
                        });

                        function replaceAll(body, find, replace) {
                            return body.replace(new RegExp(find, 'gi'), replace);
                        }
                        body = replaceAll(body, "#tag_name", tag.title);
                        var res = body.replace("#candidate_name", name).replace("#date", date);
                        resolve(res);
                    });
                } else {
                    _db2.default.Variable.findAll({}).then(function (data) {
                        _lodash2.default.forEach(data, function (val, key) {
                            function replaceAll(body, find, replace) {
                                return body.replace(new RegExp(find, 'gi'), replace);
                            }
                            body = replaceAll(body, val.variableCode, val.variableValue);
                        });

                        function replaceAll(body, find, replace) {
                            return body.replace(new RegExp(find, 'gi'), replace);
                        }
                        var res = body.replace("#candidate_name", name).replace("#date", date);
                        resolve(res);
                    });
                }
            });
        });
    },
    schedule_filter: function schedule_filter(body, name, tagId, scheduled_date, scheduled_time) {
        return new Promise(function (resolve, reject) {
            _db2.default.Tag.findOne({ where: { id: tagId } }).then(function (tag) {
                if (tag) {
                    _db2.default.Variable.findAll({}).then(function (data) {
                        _lodash2.default.forEach(data, function (val, key) {
                            function replaceAll(body, find, replace) {
                                return body.replace(new RegExp(find, 'gi'), replace);
                            }
                            body = replaceAll(body, val.variableCode, val.variableValue);
                        });

                        function replaceAll(body, find, replace) {
                            return body.replace(new RegExp(find, 'gi'), replace);
                        }
                        body = replaceAll(body, "#tag_name", tag.title);
                        var res = body.replace("#candidate_name", name).replace("#date", date).replace("#scheduled_date", scheduled_date).replace("#scheduled_time", scheduled_time);
                        resolve(res);
                    });
                } else {
                    _db2.default.Variable.findAll({}).then(function (data) {
                        _lodash2.default.forEach(data, function (val, key) {
                            function replaceAll(body, find, replace) {
                                return body.replace(new RegExp(find, 'gi'), replace);
                            }
                            body = replaceAll(body, val.variableCode, val.variableValue);
                        });

                        function replaceAll(body, find, replace) {
                            return body.replace(new RegExp(find, 'gi'), replace);
                        }
                        var res = body.replace("#candidate_name", name).replace("#date", date);
                        resolve(res);
                    });
                }
            });
        });
    },
    templateTest: function templateTest(body) {
        return new Promise(function (resolve, reject) {
            _db2.default.Variable.findAll({}).then(function (data) {
                _lodash2.default.forEach(data, function (val, key) {
                    function replaceAll(body, find, replace) {
                        return body.replace(new RegExp(find, 'gi'), replace);
                    }
                    body = replaceAll(body, val.variableCode, val.variableValue);
                });
                var res = body.replace("#date", date);
                resolve(res);
            });
        });
    }
};
//# sourceMappingURL=replaceVariable.js.map