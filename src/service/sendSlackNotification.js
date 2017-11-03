let WebClient = require('@slack/client').WebClient;
import db from "../db.js";
import config from "../config";

const slackNotification = (data) => {
    return new Promise((resolve, reject) => {
        db.Slack.findOne({ where: { status: true } }).then((slackInfo) => {
            let token = slackInfo ? slackInfo.token : config.SlackToken
            let web = new WebClient(token);
            let channel = slackInfo ? slackInfo.selected_channel : config.ChannelId;
            web.chat.postMessage(channel, data, function(err, res) {
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