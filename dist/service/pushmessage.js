'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fcmPush = require('fcm-push');

var _fcmPush2 = _interopRequireDefault(_fcmPush);

var _config = require('../config.js');

var _config2 = _interopRequireDefault(_config);

var _constant = require('../models/constant');

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pushMessage = function pushMessage(device_info, information) {
    return new Promise(function (resolve, reject) {
        var server_key = process.env.push_message_server_key || _config2.default.push_message_server_key;
        var fcm = new _fcmPush2.default(server_key);
        var message = {
            to: device_info.token, // required fill with device token or topics
            notification: {
                title: (0, _constant2.default)().push_notification_message,
                body: information,
                icon: 'ic_stat_drawing',
                sound: 'default'
            },
            data: {
                body: {
                    status: 1
                }
            },
            priority: 'high'
        };
        fcm.send(message, function (err, response) {
            if (err) {
                resolve({ error: 1, message: err, data: [] });
            } else {
                resolve({ error: 0, message: response, data: [] });
            }
        });
    });
};

exports.default = {
    pushMessage: pushMessage
};
//# sourceMappingURL=pushmessage.js.map