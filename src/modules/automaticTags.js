import db from "../db"
import _ from "lodash";
import constant from "../models/constant";
import mail from "../modules/mail";
import replace from "../modules/replaceVariable";
import config from "../config";

module.exports = {
    tags: function(subject, email_date, name, to, from, send_to) {
        return new Promise((resolve, reject) => {
            console.log(send_to)
            let count = 0;
            let tagId = [];
            let template_id = [];
            if (subject.match(new RegExp(constant().automatic_mail_subject_match, 'gi'))) {
                db.Tag.findOne({ where: { title: constant().tagType.genuine } })
                    .then((data) => {
                        resolve({ tagId: [], default_tag_id: data.id.toString() })
                    })
                    .catch((error) => { reject(error) })
            } else {
                db.Tag.findAll({ where: { type: constant().tagType.automatic } })
                    .then((data) => {
                        if (data) {
                            _.forEach(data, (val, key) => {
                                if ((subject.match(new RegExp(val.subject, 'gi'))) || ((val.to && val.from) && (new Date(email_date).getTime() < new Date(val.to).getTime() && new Date(email_date).getTime() > new Date(val.from).getTime())) || ((val.email) && (to.match(new RegExp(val.email, 'gi'))))) {
                                    tagId.push(val.id.toString())
                                    template_id.push(val.template_id)
                                }
                            })
                            db.Template.findOne({
                                where: {
                                    id: template_id[0]
                                }
                            }).then((data) => {
                                console.log(data)
                                if (data != null) {
                                    replace.filter(data.body, name, tagId[0])
                                        .then((html) => {
                                            if (config.boolean === true && send_to) {
                                                data.subject = constant().automatic_mail_subject + " " + data.subject;
                                                mail.sendMail(to, data.subject, constant().smtp.text, from, html)
                                                    .then((response) => {
                                                        resolve({ message: "Tempate Send Successfully", tagId: tagId })
                                                    })
                                            } else {
                                                resolve({ message: "Email Not Send ", tagId: tagId })
                                            }
                                        });
                                } else {
                                    if (tagId.length != 0) {
                                        resolve({ message: "Email Not send", tagId: tagId })
                                    } else {
                                        resolve({ message: "Email Not send", tagId: [] })
                                    }
                                }
                            })
                        } else {
                            resolve({ tagid: [] })
                        }
                    })
            }
        })
    }
};
