var inbox = require("../inbox");
var CronJob = require("cron").CronJob;

export class CronController {
    cron(email, logs) {
        new CronJob("*/1 * * * *", function() {
            inbox.fetchEmail(email, logs) // running this function every 60 min
                .then((response) => {
                    inbox.beforeDateEmail(email, logs);
                });
        }, null, true);
    }
}
const controller = new CronController();
export default controller;