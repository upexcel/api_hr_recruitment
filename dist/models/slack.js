"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (sequelize, DataTypes) {
    var Slack = sequelize.define("SLACK", {
        teamName: DataTypes.STRING,
        token: DataTypes.STRING,
        selected_channel: DataTypes.STRING,
        status: DataTypes.BOOLEAN
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {
            getChannelList: function getChannelList(slackInfo) {
                return new Promise(function (resolve, reject) {
                    console.log(slackInfo);
                    var web = new WebClient(slackInfo.token);
                    web.channels.list(function (err, res) {
                        if (!err) {
                            resolve(res.channels);
                        } else {
                            reject("Something happend Wrong");
                        }
                    });
                });
            },
            slackData: function slackData() {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    var slackData = [];
                    _this.findAll().then(function (response) {
                        if (response.length) {
                            findChannel(response, function (slackAccount) {
                                resolve(slackAccount);
                            });
                        } else {
                            resolve(response);
                        }
                    });

                    function findChannel(slackAccounts, callback) {
                        var account = slackAccounts.splice(0, 1)[0];
                        var web = new WebClient(account.token);
                        web.channels.list(function (err, res) {
                            if (!err) {
                                slackData.push({ id: account.id, teamName: account.teamName, token: account.token, selected_channel: account.selected_channel, status: account.status, channel_list: res.channels });
                            } else {
                                console.log(err);
                                callback("Something happend Wrong");
                            }
                            if (slackAccounts.length) {
                                findChannel(slackAccounts, callback);
                            } else {
                                callback(slackData);
                            }
                        });
                    }
                });
            }
        }
    });
    return Slack;
};

var WebClient = require('@slack/client').WebClient;
//# sourceMappingURL=slack.js.map