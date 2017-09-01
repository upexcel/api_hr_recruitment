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
            createDevice(body) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { email_id: body.email_id } })
                        .then((device) => {
                            if (device) {
                                this.update(body, { where: { email_id: body.email_id } })
                                    .then((response) => { resolve(response) })
                            } else {
                                this.create(body)
                                    .then((data) => { resolve(data) })
                            }
                        })
                })
            },
            logout(email_id, device_id) {
                return new Promise((resolve, reject) => {
                    this.update({ token: null, device_id: null }, { where: { email_id: email_id, device_id: device_id } })
                        .then((response) => {
                            resolve(response)
                        }, (err) => { reject(err) })
                })
            }
        }
    });
    return Candidate_device;
}