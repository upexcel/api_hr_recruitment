let WebClient = require('@slack/client').WebClient;
import db from "../db.js";
import config from "../config";
import request from "request";

const slackNotification = (data, user_email) => {
    return new Promise((resolve, reject) => {
        db.Slack.findOne({ where: { status: true } }).then((slackInfo) => {
            let token = slackInfo ? slackInfo.token : process.env.SlackToken || config.SlackToken
            let web = new WebClient(token);
            let channel = slackInfo ? slackInfo.selected_channel : process.env.ChannelId ||config.ChannelId;
            userIcon(user_email, function(response) {
                data += "\n picture: " + response;
                web.chat.postMessage(channel, data, function(err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res)
                    }
                });
            })

            function userIcon(email, callback) {
                request(`http://picasaweb.google.com/data/entry/api/user/${email}?alt=json`, function(error, response, body) {
                    if (!error) {
                        callback(JSON.parse(body).entry.gphoto$thumbnail.$t)
                    }
                });
            }
        })

    })
}

export default {
    slackNotification
}