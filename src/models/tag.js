import _ from 'lodash';
export default function(sequelize, DataTypes) {
    const Tag = sequelize.define("TAG", {
        email: {
            type: DataTypes.STRING,
        },
        title: {
            type: DataTypes.STRING,
            unique: true,
        },
        color: DataTypes.STRING,
        subject: DataTypes.STRING,
        type: {
            type: DataTypes.ENUM,
            values: ["Default", "Manual", "Automatic"],
        },
        to: DataTypes.DATE,
        from: DataTypes.DATE,
        template_id: { type: DataTypes.INTEGER },
    }, {
        hooks: {
            beforeCreate: function(TAG, options) {
                return new Promise((resolve, reject) => {
                    this.findOne({ where: { title: { like: "%" + TAG.title + "%" } } })
                        .then((docs) => {
                            if (docs) {
                                reject("This Title Already Exists");
                            } else {
                                resolve({ docs })
                            }
                        })
                })
            }
        },
        timestamps: true,
        freezeTableName: true,
        allowNull: true,
        classMethods: {
            // login.....
            tag(tag_id) {
                app.route("/tag/add/:type").post(tag.save);
                return new Promise((resolve, reject) => {
                    this.find({
                            where: {
                                id: tag_id
                            }
                        })
                        .then((details) => {
                            if (details) {
                                resolve({
                                    status: 1
                                });
                            } else {
                                reject("Invalid tag_id");
                            }
                        });
                });
            },
            assignTag(tag, email) {
                return new Promise((resolve, reject) => {
                    var count = 0;
                    email.find({})
                        .then((data) => {
                            var id = []
                            _.map(data, (val, key) => {
                                if ((val.subject.match(new RegExp(tag.title, 'gi'))) /*|| ((tag.to && tag.from) && (new Date(val.date).getTime() < new Date(tag.to).getTime() && new Date(val.date).getTime() > new Date(tag.from).getTime()))*/ || (val.sender_mail.match(new RegExp(tag.email, 'gi')))) {
                                    id.push(val._id);
                                    count++
                                    if (key == (_.size(data) - 1)) {
                                        resolve(id)
                                    }
                                } else {
                                    if (key == (_.size(data) - 1)) {
                                        resolve(id)
                                    }
                                }

                            })
                        }, (err) => {
                            reject(err)
                        })
                })
            }
        },
        associate: (models) => {
            Tag.belongsTo(models.Template, { foreignKey: 'template_id' })
        }
    });
    return Tag;
}
