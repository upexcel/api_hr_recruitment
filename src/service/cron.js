let inbox = require("../inbox");
let CronJob = require("cron").CronJob;
import service from "../service/reminder"

export class CronController {
    cron(email, logs) {
        new CronJob("*/20 * * * *", function() {
            inbox.fetchEmail(email, logs) // running this function every 60 min
                .then((response) => {
                    inbox.skippedDates(email, logs)
                        .then((data) => {
                            inbox.beforeDateEmail(email, logs);
                        })
                });
        }, null, true);
    }

    reminder(email, logs) {
        new CronJob('00 00 18 * * 1-7', function() { // cron is running every day at 06:00 PM
            service.reminderMail(email, logs)
                .then((data) => console.log(data))
        }, null, true);
    }

    PendingEmails(cron_service, logs, email) {
        new CronJob("*/1 * * * *", function() {
            service.sendEmailToPendingCandidate(cron_service, logs, email)
                .then((response) => {
                    service.sendEmailToNotRepliedCandidate(cron_service, logs, email)
                        .then((email_status) => {
                            service.sendToSelected(cron_service, logs, email)
                                .then((selected_response) => {
                                    service.sendToAll(cron_service, logs, email)
                                        .then((send_to_all_response) => {
                                            console.log(response, email_status, selected_response, send_to_all_response)
                                        })
                                })
                        })
                })
        }, null, true)
    }
}
const controller = new CronController();
export default controller;