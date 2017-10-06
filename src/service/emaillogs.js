import Imap from "imap";
import moment from "moment";

export class EmailLogs {
    emailLog(log, data) {
        return new Promise((resolve, reject) => {
            let logs = {};
            if (data && data.status) {
                if (log.emailLogs) {
                    logs = new log.emailLogs({ email: data.email_response.envelope.to, from: data.email_response.envelope.from, time: new Date(), user: log.user.email, subject: data.subject, body: data.body })
                } else {
                    logs = new log({ email: data.email_response.envelope.to, from: data.email_response.envelope.from, time: new Date(), user: "By Cron", subject: data.subject, body: data.body, tag_id: data.tag_id })
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