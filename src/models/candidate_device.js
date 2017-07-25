import pushNotification from "../service/pushmessage"
export default function(sequelize, DataTypes) {
    const Candidate_device = sequelize.define("CANDIDATE_DEVICE", {
        email_id: DataTypes.STRING,
        device_id: DataTypes.STRING,
        token: DataTypes.STRING,
    }, {
        hooks: {
            beforeCreate: function(CANDIDATE_DEVICE) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { "$or": [{ email_id: CANDIDATE_DEVICE.email_id }, { device_id: CANDIDATE_DEVICE.device_id }] } })
                        .then((email) => {
                            if (email) {
                                reject("depuplicate device information");
                            } else {
                                resolve();
                            }
                        });
                });

            }
        },
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {
            pushNotification(data) {
                return new Promise((resolve, reject) => {
                    this.findOne({ email_id: data.sender_mail })
                        .then((device_info) => {
                            if (device_info) {
                                pushNotification.pushMessage(device_info)
                                    .then((response) => { resolve() })
                            } else {
                                resolve()
                            }
                        })
                })
            }
        },
    });
    return Candidate_device;
}