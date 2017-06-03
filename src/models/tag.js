export default function(sequelize, DataTypes) {
    const Tag = sequelize.define("TAG", {
        email: {
            type: DataTypes.STRING,
        },
        title: DataTypes.STRING,
        color: DataTypes.STRING,
        subject: DataTypes.STRING,
        type: {
            type: DataTypes.ENUM,
            values: ["Default", "Manual", "Automatic"],
        },
        to: DataTypes.DATE,
        from: DataTypes.DATE,
        template_id: { type: DataTypes.INTEGER, defaultValue: 0 },
    }, {
        hooks: {
            beforeCreate: function(TAG, options) {
                return new Promise((resolve, reject) => {
                    if (TAG.type === "Automatic") {
                        this.findOne({ where: { title: { like: "%" + TAG.title + "%" } } })
                            .then((docs) => {
                                if (docs) {
                                    reject("This title Already Exists");
                                } else {
                                    resolve({ docs })
                                }
                            })
                    } else {
                        resolve()
                    }
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
            }
        }
    });

    return Tag;
}
