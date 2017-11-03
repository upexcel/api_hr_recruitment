let WebClient = require('@slack/client').WebClient;

export default function(sequelize, DataTypes) {
    const Slack = sequelize.define("SLACK", {
        teamName: DataTypes.STRING,
        token: DataTypes.STRING,
        selected_channel:DataTypes.STRING,
        status:DataTypes.BOOLEAN
    }, {
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {
            getChannelList(id) {
                return new Promise((resolve, reject) => {
                    this.findById(id).then((slackInfo) => {
                        let web = new WebClient(slackInfo.get('token'))
                        web.channels.list(function(err, res){
                            if(!err){
                                resolve(res.channels)
                            }else{
                                reject("Something happend Wrong")
                            }
                        })
                    })
                });
            }
        }
    });
    return Slack;
}