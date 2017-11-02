import constant from '../models/constant'
import moment from 'moment'
import mail from '../modules/mail'
import replaceData from "../modules/replaceVariable";
import db from "../db";
import email_log from "./emaillogs.js";

let reminderMail = (email, logs) => {
    return new Promise((resolve, reject) => {
        let dateTime = new Date();
        let start = moment(dateTime).format("YYYY-MM-DD"); //currnet date 
        let end = moment(start).add(1, 'days').format("YYYY-MM-DD"); // next date
        let id_list = []
        email.find({ shedule_date: { "$gte": start, "$eq": end } }, { "shedule_date": 1, "shedule_time": 1, "tag_id": 1, "from": 1, "send_template": 1, "sender_mail": 1 }).exec(function(err, response) {
            if (response.length) {
                sendReminder(response, function(reminder_status) {
                    email.update({ "_id": { "$in": body.mongo_id } }, { reminder_send: 1 }, { multi: true }).exec(function(err, update_response) {
                        if (!err) {
                            resolve(reminder_status)
                        }
                    })
                })
            } else {
                resolve("No email is sheduled for tomorrow")
            }
        })

        function sendReminder(mail_data, callback) { // function for sending reminder
            let user_info = mail_data.splice(0, 1)[0];
            id_list.push(user_info._id)
            db.Template.findById(parseInt(user_info.send_template)) // finding template that is send to candiadte
                .then((template_data) => {
                    replaceData.filter(template_data.body, user_info.from, user_info.tag_id[0]) // replace user variables
                        .then((replaced_data) => {
                            db.Smtp.findOne({ where: { status: 1 } })
                                .then((smtp) => {
                                    let subject = constant().reminder + " " + moment(user_info.shedule_date).format("YYYY-MM-DD") + " at " + user_info.shedule_time // subject for remonder email
                                    mail.sendMail(user_info.sender_mail, subject, "", smtp, replaced_data) // sending email
                                        .then((mail_response) => {
                                            mail_response['user'] = "Reminder";
                                            email_log.emailLog(logs, mail_response).then((mail_log) => {
                                                if (mail_data.length) {
                                                    sendReminder(mail_data, callback)
                                                } else {
                                                    callback({ message: "Reminder Sent To Selected Users" })
                                                }
                                            })
                                        })
                                })
                        })
                })
        }
    })
}


let sendEmailToPendingCandidate = (cron_service, logs, email) => {
    return new Promise((resolve, reject) => {
        cron_service.findOne({ status: 1, work: constant().pending_work }).exec(function(err, cronWorkData) {
            if (cronWorkData && cronWorkData.get('candidate_list').length) {
                db.Smtp.findOne({ where: { status: 1 } })
                    .then((smtp) => {
                        db.Template.findById(cronWorkData.get('template_id')).then((template) => {
                            email.find({ _id: cronWorkData.get('candidate_list')[0]._id, "$or": [{ is_automatic_email_send: 0 }, { is_automatic_email_send: { "$exists": false } }] }, { "_id": 1, "sender_mail": 1, "from": 1, "is_automatic_email_send": 1, "subject": 1 }).exec(function(err, result) {
                                if (result) {
                                    sendTemplateToEmails(cronWorkData.get('candidate_list')[0], template, smtp, function(err, data) {
                                        if (err) {
                                            reject(err)
                                        } else {
                                            resolve(data)
                                        }
                                    })
                                } else {
                                    cron_service.update({ _id: cronWorkData.get('_id') }, { $pull: { candidate_list: cronWorkData.get('candidate_list')[0] } }).exec(function(err, updated_cronWork) {
                                        if (!err) {
                                            console.log(updated_cronWork)
                                            resolve("Email Sent To candidate")
                                        }
                                    })
                                }
                            })
                        })

                        function sendTemplateToEmails(emails, template, smtp, callback) {
                            let subject = "";
                            console.log(emails)
                            if (!smtp) {
                                callback("Not active Smtp", null);
                            }
                            let email_id = emails;
                            replaceData.filter(template.body, email_id.from, emails.tag_id)
                                .then((html) => {
                                    subject = template.subject;
                                    mail.sendMail(email_id.sender_mail, subject, constant().smtp.text, smtp, html, true)
                                        .then((response) => {
                                            response['user'] = cronWorkData.get('user');
                                            response['tag_id'] = emails.tag_id;
                                            email_log.emailLog(logs, response)
                                                .then((log_response) => {
                                                    email.update({ "_id": email_id._id }, { is_automatic_email_send: 1, send_template_count: 1, template_id: [template.id],reply_to_id:response.reply_to })
                                                        .then((data1) => {
                                                            cron_service.update({ _id: cronWorkData.get('_id') }, { "$pull": { candidate_list: emails } }).exec(function(err, updated_cronWork) {
                                                                if (!err) {
                                                                    console.log(updated_cronWork)
                                                                    callback(null, "email sent to pending candidate")
                                                                }
                                                            })
                                                        })
                                                })
                                        })

                                })

                        }
                    })
            } else {
                cron_service.findOneAndUpdate({ status: 1, work: constant().pending_work }, { $set: { status: 0 } }).exec(function(err, update_status) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve("Nothing in Pending")
                    }
                })
            }
        })
    })
}


let sendEmailToNotRepliedCandidate = (cron_service, logs, email) => {
    return new Promise((resolve, reject) => {
        cron_service.findOne({ status: 1, work: constant().not_replied }).then((cronWorkData) => {
            if (cronWorkData && cronWorkData.get('candidate_list').length) {
                db.Smtp.findOne({ where: { status: 1 } })
                    .then((smtp) => {
                        sendTemplateToEmails(cronWorkData, smtp, function(err, response) {
                            resolve("SUCCESS")
                        })

                        function sendTemplateToEmails(cronWorkData, smtp, callback) {
                            let subject = cronWorkData.get('subject');
                            let candidate_info = cronWorkData.get("candidate_list")[0];
                            if (!smtp) {
                                callback("Not active Smtp", null);
                            }
                            replaceData.filter(cronWorkData.get('body'), candidate_info.from, cronWorkData.tag_id)
                                .then((html) => {
                                    mail.sendMail(candidate_info.sender_mail, subject, constant().smtp.text, smtp, html).then((mail_response) => {
                                        email_log.emailLog(logs, mail_response)
                                            .then((log_response) => {
                                                email.update({ _id: candidate_info._id }, { $inc: { send_template_count: 1 }, $push: { template_id: parseInt(cronWorkData.get('template_id')) }, is_automatic_email_send: 1 }).then((response) => {
                                                    cron_service.findOneAndUpdate({ _id: cronWorkData._id }, { "$pull": { candidate_list: candidate_info } }).then((updated_cronWork) => {
                                                        callback(null, updated_cronWork)
                                                    })
                                                })
                                            })
                                    })
                                })
                        }
                    })
            } else {
                cron_service.findOneAndUpdate({ status: 1, work: constant().not_replied }, { $set: { status: 0 } }).exec(function(err, update_status) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve("Nothing in Pending")
                    }
                })
            }
        })
    });
}

let sendToSelected = (cron_service, logs, email) => {
    return new Promise((resolve, reject) => {
        cron_service.findOne({ status: 1, work: constant().selectedCandidate }).then((cronWorkData) => {
            if (cronWorkData != null ? cronWorkData.get('candidate_list').length : false) {
                db.Smtp.findOne({ where: { status: 1 } }).then((smtp) => {
                    let email = cronWorkData.get('candidate_list')[0];
                    mail.sendMail(email, cronWorkData.get('subject'), constant().smtp.text, smtp, cronWorkData.get('body')).then((mail_response) => {
                        email_log.emailLog(logs, mail_response)
                            .then((log_response) => {
                                cron_service.findOneAndUpdate({ _id: cronWorkData._id }, { "$pull": { candidate_list: email } }).then((updated_cronWork) => {
                                    resolve("SUCCESS")
                                })
                            })
                    })
                })
            } else {
                if (!cronWorkData) {
                    resolve("Nothing In Pending")
                } else {
                    cron_service.findOneAndUpdate({ _id: cronWorkData.get('_id') }, { status: 0 }).then((updated_cronWork) => {
                        resolve("Nothing In Pending")
                    })
                }
            }
        })
    });
}

let sendToAll = (cron_service, logs, email) => {
    return new Promise((resolve, reject) => {
        cron_service.findOne({ status: 1, work: constant().sendToAll }).then((cronWorkData) => {
            if (cronWorkData != null ? cronWorkData.get('candidate_list').length : false) {
                db.Smtp.findOne({ where: { status: 1 } }).then((smtp) => {
                    let email_data = cronWorkData.get('candidate_list')[0];
                    console.log(email_data)
                    mail.sendMail(email_data, cronWorkData.get('subject'), constant().smtp.text, smtp, cronWorkData.get('body')).then((mail_response) => {
                        email_log.emailLog(logs, mail_response)
                            .then((log_response) => {
                                cron_service.findOneAndUpdate({ _id: cronWorkData._id }, { "$pull": { candidate_list: email_data } }).then((updated_cronWork) => {
                                    resolve("SUCCESS")
                                })
                            })
                    })
                })
            } else {
                if (!cronWorkData) {
                    resolve("Nothing In Pending")
                } else {
                    cron_service.findOneAndUpdate({ _id: cronWorkData.get('_id') }, { status: 0 }).then((updated_cronWork) => {
                        resolve("Nothing In Pending")
                    })
                }
            }
        })
    });
}
export default {
    reminderMail,
    sendEmailToPendingCandidate,
    sendEmailToNotRepliedCandidate,
    sendToSelected,
    sendToAll
}