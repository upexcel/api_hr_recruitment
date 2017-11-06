let WebClient = require('@slack/client').WebClient;

export default function(sequelize, DataTypes) {
    const Slack = sequelize.define("SLACK", {
        teamName: DataTypes.STRING,
        token: DataTypes.STRING,
        selected_channel: DataTypes.STRING,
        status: DataTypes.BOOLEAN
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {
            getChannelList(slackInfo) {
                return new Promise((resolve, reject) => {
                    console.log(slackInfo)
                    let web = new WebClient(slackInfo.token)
                    web.channels.list(function(err, res) {
                        if (!err) {
                            resolve(res.channels)
                        } else {
                            reject("Something happend Wrong")
                        }
                    })
                });
            },
            slackData() {
                return new Promise((resolve, reject) => {
                    let slackData = [];
                    this.findAll().then((response) => {
                        if (response.length) {
                            findChannel(response, function(slackAccount) {
                                resolve(slackAccount)
                            })
                        } else {
                            resolve(response)
                        }
                    })

                    function findChannel(slackAccounts, callback) {
                        let account = slackAccounts.splice(0, 1)[0]
                        let web = new WebClient(account.token)
                        web.channels.list(function(err, res) {
                            if (!err) {
                                slackData.push({ id: account.id, teamName: account.teamName, token: account.token, selected_channel: account.selected_channel, status: account.status, channel_list: res.channels })
                            } else {
                                console.log(err)
                                callback("Something happend Wrong")
                            }
                            if (slackAccounts.length) {
                                findChannel(slackAccounts, callback)
                            } else {
                                callback(slackData)
                            }
                        })
                    }
                });
            }
        }
    });
    return Slack;
}