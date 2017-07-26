import FCM from 'fcm-push';
import config from '../config.js';
let pushMessage = (device_info) => {
    return new Promise((resolve, reject) => {
        console.log(device_info)
        resolve()
        // let server_key = config.push_message_server_key;
        // let fcm = new FCM(serverKey);
        // let message = {
        //     to: device_info.token, // required fill with device token or topics
        //     collapse_key: 'your_collapse_key',
        //     notification: {
        //         title: 'Title of your push notification',
        //         body: 'Body of your push notification'
        //     }
        // };
        // fcm.send(message, function(err, response) {
        //     if (err) {
        //         console.log("Something has gone wrong!");
        //         reject({ error: 1, message: err, data: [] })
        //     } else {
        //         console.log("Successfully sent with response: ", response);
        //         resolve({ error: 0, message: response, data: [] })
        //     }
        // });
    })
}

export default {
    pushMessage
}