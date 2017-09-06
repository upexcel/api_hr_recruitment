let inbox = require("../inbox");
let CronJob = require("cron").CronJob;
import service from "../service/reminder"

export class CronController {
    cron(email, logs) {
        new CronJob("*/60 * * * *", function() {
            inbox.fetchEmail(email, logs) // running this function every 60 min
                .then((response) => {
                    inbox.beforeDateEmail(email, logs);
                });
        }, null, true);
    }

    reminder(email) {
        new CronJob('00 00 12 * * 1-7', function() {
            service.reminderMail(email)
                .then((data) => console.log(data))
        }, null, true);
    }
}
const controller = new CronController();
export default controller;