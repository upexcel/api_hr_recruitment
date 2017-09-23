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

export default {
    reminderMail
}