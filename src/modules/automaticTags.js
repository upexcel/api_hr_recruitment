import db from "../db"
import _ from "lodash";
import constant from "../models/constant";
import mail from "../modules/mail";
import replace from "../modules/replaceVariable";
import config from "../config"
module.exports = {
    tags: function(subject, email_date, from, email) {
        return new Promise((resolve, reject) => {
            let count = 0;
            let tagId = [];
            let template_id = [];
            if (subject.match(/Re:/g)) {
                db.Tag.findOne({ where: { title: constant().tagType.genuine } })
                    .then((data) => {
                        resolve({ tagId: data.id.toString() })
                    })
                    .catch((error) => { reject(error) })
            } else {
                db.Tag.findAll({ where: { type: constant().tagType.automatic } })
                    .then((data) => {
                        _.forEach(data, (val, key) => {
                            if ((subject.match(new RegExp(val.title, 'gi'))) || (new Date(email_date).getTime() < new Date(val.to).getTime() && new Date(email_date).getTime() > new Date(val.from).getTime())) {
                                tagId.push(val.id)
                                template_id.push(val.template_id)
                            } else {
                                ++count;
                                if (count == _.size(data)) {
                                    resolve({ tagId: [] });
                                }
                            }
                        })
                        db.Template.findOne({
                            where: {
                                id: template_id[0]
                            }
                        }).then((data) => {
                            if (data != null) {
                                replace.filter(data.body, from)
                                    .then((html) => {
                                        if (config.boolean === true) {
                                            mail.sendMail(email, data.subject, constant().smtp.text, constant().smtp.from, html)
                                                .then((response) => {
                                                    resolve({ message: "Tempate Send Successfully", tagId: tagId.toString() })
                                                })
                                        } else {
                                            resolve({ message: "Email Not Send ", tagId: tagId.toString() })
                                        }
                                    });
                            } else {
                                resolve({ message: "Email Not send", tagId: [] })
                            }
                        })
                    })
            }
        })
    }
};
