let WebClient = require('@slack/client').WebClient;
import db from "../db.js";

const slackNotification = (data) => {
    return new Promise((resolve, reject) => {
        db.Slack.findOne({ where: { status: true } }).then((slackInfo) => {
            let web = new WebClient(slackInfo.token);
            web.chat.postMessage(slackInfo.selected_channel, data, function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res)
                }
            });
        })

    })
}

export default {
    slackNotification
}