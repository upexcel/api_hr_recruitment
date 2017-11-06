"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require("../db.js");

var _db2 = _interopRequireDefault(_db);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebClient = require('@slack/client').WebClient;


var slackNotification = function slackNotification(data, user_email) {
    return new Promise(function (resolve, reject) {
        _db2.default.Slack.findOne({ where: { status: true } }).then(function (slackInfo) {
            var token = slackInfo ? slackInfo.token : process.env.SlackToken || _config2.default.SlackToken;
            var web = new WebClient(token);
            var channel = slackInfo ? slackInfo.selected_channel : process.env.ChannelId || _config2.default.ChannelId;
            userIcon(user_email, function (response) {
                data += "\n picture: " + response;
                web.chat.postMessage(channel, data, function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            });

            function userIcon(email, callback) {
                (0, _request2.default)("http://picasaweb.google.com/data/entry/api/user/" + email + "?alt=json", function (error, response, body) {
                    if (!error) {
                        callback(JSON.parse(body).entry.gphoto$thumbnail.$t);
                    }
                });
            }
        });
    });
};

exports.default = {
    slackNotification: slackNotification
};
//# sourceMappingURL=sendSlackNotification.js.map