"use strict";

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _mail = require("../modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _replaceVariable = require("../modules/replaceVariable");

var _replaceVariable2 = _interopRequireDefault(_replaceVariable);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _emaillogs = require("../service/emaillogs");

var _emaillogs2 = _interopRequireDefault(_emaillogs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    tags: function tags(mongodb, subject, email_date, name, to, from, logs, reply_to, send_to) {
        return new Promise(function (resolve, reject) {
            var count = 0;
            var tagId = [];
            var template_id = [];
            var is_email_send = 0;
            mongodb.findOne({ reply_to_id: reply_to }).then(function (genuine) {
                if (genuine) {
                    _db2.default.Tag.findOne({ where: { title: (0, _constant2.default)().tagType.genuine } }).then(function (data) {
                        get_email_already_save(to, function (tagId) {
                            if (tagId.length) {
                                resolve({ tagId: tagId, default_tag_id: data.id.toString(), is_automatic_email_send: 1 });
                            } else {
                                resolve({ tagId: [], default_tag_id: data.id.toString(), is_automatic_email_send: 1 });
                            }
                        });

                        function get_email_already_save(email_id, callback) {
                            mongodb.findOne({ sender_mail: email_id, tag_id: { "$not": { "$size": 0 } } }).limit(1).sort({ date: -1 }).exec(function (err, response) {
                                if (response) {
                                    callback(response.tag_id);
                                } else {
                                    callback([]);
                                }
                            });
                        }
                    }).catch(function (error) {
                        reject(error);
                    });
                } else {
                    _db2.default.Tag.findAll({ where: { type: (0, _constant2.default)().tagType.automatic } }).then(function (data) {
                        if (data) {
                            _lodash2.default.forEach(data, function (val, key) {
                                if (subject.match(new RegExp(val.subject, 'gi')) || val.to && val.from && new Date(email_date).getTime() < new Date(val.to).getTime() && new Date(email_date).getTime() > new Date(val.from).getTime() || val.email && to.match(new RegExp(val.email, 'gi'))) {
                                    tagId.push(val.id.toString());
                                    template_id.push(val.template_id);
                                    if (!is_email_send && val.is_email_send) is_email_send = val.is_email_send;
                                }
                            });
                            var default_tag_id = "";
                            _db2.default.Template.findOne({
                                where: {
                                    id: template_id[0]
                                }
                            }).then(function (data) {
                                _db2.default.Tag.findAll({ where: { type: (0, _constant2.default)().tagType.default, parent_id: { "$in": tagId.map(function (x) {
                                                return parseInt(x, 10);
                                            }) } } }).then(function (result) {
                                    _lodash2.default.forEach(result, function (val, key) {
                                        if (subject.match(new RegExp(val.subject, 'gi')) || val.to && val.from && new Date(email_date).getTime() < new Date(val.to).getTime() && new Date(email_date).getTime() > new Date(val.from).getTime() || val.email && to.match(new RegExp(val.email, 'gi'))) {
                                            default_tag_id = val.id.toString();
                                        }
                                    });
                                    if (data != null) {
                                        _replaceVariable2.default.filter(data.body, name, tagId[0]).then(function (html) {
                                            _db2.default.Smtp.findOne({ where: { status: 1 } }).then(function (smtp) {
                                                if (_config2.default.send_automatic_tags_email === true && send_to && is_email_send) {
                                                    _mail2.default.sendMail(to, data.subject, (0, _constant2.default)().smtp.text, smtp, html, true).then(function (response) {
                                                        response['tag_id'] = tagId;
                                                        _emaillogs2.default.emailLog(logs, response).then(function (data) {
                                                            if (response.status) {
                                                                resolve({ message: "Tempate Send Successfully", tagId: tagId, is_automatic_email_send: 1, count: 1, template_id: template_id[0], reply_to_id: response.reply_to, default_tag_id: default_tag_id });
                                                            } else {
                                                                resolve({ message: "Tempate Not Send Successfully", tagId: tagId, is_automatic_email_send: 0, default_tag_id: default_tag_id });
                                                            }
                                                        });
                                                    });
                                                } else {
                                                    resolve({ message: "Email Not Send ", tagId: tagId, default_tag_id: default_tag_id });
                                                }
                                            });
                                        });
                                    } else {
                                        if (tagId.length != 0) {
                                            resolve({ message: "Email Not send", tagId: tagId, default_tag_id: default_tag_id });
                                        } else {
                                            resolve({ message: "Email Not send", tagId: [] });
                                        }
                                    }
                                });
                            });
                        } else {
                            resolve({ tagid: [] });
                        }
                    });
                }
            });
        });
    }
};
//# sourceMappingURL=automaticTags.js.map