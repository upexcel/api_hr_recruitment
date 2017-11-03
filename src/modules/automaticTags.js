import db from "../db"
import _ from "lodash";
import constant from "../models/constant";
import mail from "../modules/mail";
import replace from "../modules/replaceVariable";
import config from "../config";
import email_log from "../service/emaillogs"

module.exports = {
    tags: function(mongodb, subject, email_date, name, to, from, logs, reply_to, send_to) {
        return new Promise((resolve, reject) => {
            let count = 0;
            let tagId = [];
            let template_id = [];
            let is_email_send = 0;
            mongodb.findOne({ reply_to_id: reply_to }).then((genuine) => {
                if (genuine) {
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
                                mongodb.findOne({ sender_mail: email_id, tag_id: { "$not": { "$size": 0 } } }).limit(1).sort({ date: -1 }).exec(function(err, response) {
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
                                        template_id.push(val.template_id);
                                        if (!is_email_send && val.is_email_send)
                                            is_email_send = val.is_email_send;
                                    }
                                })
                                let default_tag_id = "";
                                db.Template.findOne({
                                    where: {
                                        id: template_id[0]
                                    }
                                }).then((data) => {
                                    db.Tag.findAll({ where: { type: constant().tagType.default, parent_id: { "$in": tagId.map(function(x) { return parseInt(x, 10); }) } } })
                                        .then((result) => {
                                            _.forEach(result,(val, key)=>{
                                              if ((subject.match(new RegExp(val.subject, 'gi'))) || ((val.to && val.from) && (new Date(email_date).getTime() < new Date(val.to).getTime() && new Date(email_date).getTime() > new Date(val.from).getTime())) || ((val.email) && (to.match(new RegExp(val.email, 'gi'))))) {
                                                default_tag_id = val.id.toString();
                                            }  
                                            })
                                            if (data != null) {
                                                replace.filter(data.body, name, tagId[0])
                                                    .then((html) => {
                                                        db.Smtp.findOne({ where: { status: 1 } })
                                                            .then((smtp) => {
                                                                if (config.send_automatic_tags_email === true && send_to && is_email_send) {
                                                                    mail.sendMail(to, data.subject, constant().smtp.text, smtp, html, true)
                                                                        .then((response) => {
                                                                            response['tag_id'] = tagId;
                                                                            email_log.emailLog(logs, response)
                                                                                .then((data) => {
                                                                                    if (response.status) {
                                                                                        resolve({ message: "Tempate Send Successfully", tagId: tagId, is_automatic_email_send: 1, count: 1, template_id: template_id[0], reply_to_id: response.reply_to, default_tag_id: default_tag_id })
                                                                                    } else {
                                                                                        resolve({ message: "Tempate Not Send Successfully", tagId: tagId, is_automatic_email_send: 0, default_tag_id: default_tag_id })
                                                                                    }
                                                                                })
                                                                        })

                                                                } else {
                                                                    resolve({ message: "Email Not Send ", tagId: tagId, default_tag_id: default_tag_id })
                                                                }
                                                            })
                                                    });
                                            } else {
                                                if (tagId.length != 0) {
                                                    resolve({ message: "Email Not send", tagId: tagId, default_tag_id: default_tag_id })
                                                } else {
                                                    resolve({ message: "Email Not send", tagId: [] })
                                                }
                                            }
                                        })
                                })
                            } else {
                                resolve({ tagid: [] })
                            }
                        })
                }
            })

        })
    }
};