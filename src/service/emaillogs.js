import Imap from "imap";
import moment from "moment";

export class EmailLogs {
    emailLog(log, data) {
        return new Promise((resolve, reject) => {
            let logs = {};
            if (data && data.status) {
                let email_response = data.email_response.response.split(" ");
                let time = moment.unix(email_response[3]).format("MMM DD, YYYY HH:mm");
                if (log.emailLogs) {
                    logs = new log.emailLogs({ email: data.email_response.envelope.to, from: data.email_response.envelope.from, time: time, user: log.user.email })
                } else {
                    logs = new log({ email: data.email_response.envelope.to, from: data.email_response.envelope.from, time: time, user: "By Cron" })
                }
                logs.save(function(err, result) {
                    if (!err)
                        resolve("SUCCESS");
                    else
                        console.log(err)
                })
            } else {
                resolve("SUCCESS");
            }
        });
    }
}
const email_log = new EmailLogs();
export default email_log;