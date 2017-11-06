import FCM from 'fcm-push';
import config from "../config.js";
import constant from '../models/constant'
let pushMessage = (device_info, information) => {
    return new Promise((resolve, reject) => {
        let server_key = process.env.push_message_server_key || config.push_message_server_key;
        let fcm = new FCM(server_key);
        let message = {
            to: device_info.token, // required fill with device token or topics
            notification: {
                title: constant().push_notification_message,
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
        fcm.send(message, function(err, response) {
            if (err) {
                resolve({ error: 1, message: err, data: [] })
            } else {
                resolve({ error: 0, message: response, data: [] })
            }
        });

    })
}

export default {
    pushMessage
}