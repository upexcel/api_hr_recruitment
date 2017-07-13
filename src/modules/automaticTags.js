import db from "../db"
import _ from "lodash";
import constant from "../models/constant";
import mail from "../modules/mail";
import replace from "../modules/replaceVariable";
import config from "../config";

module.exports = {
    tags: function(mongodb, subject, email_date, name, to, from, send_to) {
        return new Promise((resolve, reject) => {
            let count = 0;
            let tagId = [];
            let template_id = [];
            if (subject.match(new RegExp(constant().automatic_mail_subject_match, 'gi'))) {
                db.Tag.findOne({ where: { title: constant().tagType.genuine } })
                    .then((data) => {
                        get_email_already_save(to, function(tagId) {
                            if (tagId.length) {
                                resolve({ tagId: tagId, default_tag_id: data.id.toString(), is_automatic_email_send: 1 })
                            } else {
                                resolve({ tagId: [], default_tag_id: data.id.toString(), is_automatic_email_send: 1 })
                            }
                        })

                        function get_email_already_save(email_id, callback) {
                            mongodb.findOne({ sender_mail: email_id, tag_id: { "$size": { "$gt": 0 } } }).limit(1).sort({ date: -1 }).exec(function(err, response) {
                                // console.log(response)
                                if (response) {
                                    callback(response.tag_id)
                                } else {
                                    callback([])
                                }

                            })
                        }

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
                                if (data != null) {
                                    replace.filter(data.body, name, tagId[0])
                                        .then((html) => {
                                            if (config.send_automatic_tags_email === true && send_to) {
                                                data.subject = constant().automatic_mail_subject + " " + data.subject;
                                                db.tag.Smtp.findOne({ where: { status: 1 } })
                                                    .then((smtp) => {
                                                        mail.sendMail(to, data.subject, constant().smtp.text, smtp.email, html)
                                                            .then((response) => {
                                                                if (response.status) {
                                                                    resolve({ message: "Tempate Send Successfully", tagId: tagId, is_automatic_email_send: 1 })
                                                                } else {
                                                                    resolve({ message: "Tempate Not Send Successfully", tagId: tagId, is_automatic_email_send: 0 })
                                                                }
                                                            })
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
