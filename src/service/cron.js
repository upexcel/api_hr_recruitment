let inbox = require("../inbox");
let CronJob = require("cron").CronJob;
import service from "../service/reminder"

export class CronController {
    cron(email, logs) {
        new CronJob("*/60 * * * *", function() {
        inbox.fetchEmail(email, logs) // running this function every 60 min
            .then((response) => {
                inbox.skippedDates(email, logs)
                    .then((data) => {
                        inbox.beforeDateEmail(email, logs);
                    })
            });
        }, null, true);
    }

    reminder(email) {
        new CronJob('00 00 18 * * 1-7', function() { // cron is running every day at 06:00 PM
            service.reminderMail(email)
                .then((data) => console.log(data))
        }, null, true);
    }
}
const controller = new CronController();
export default controller;