import _ from "lodash";
module.exports = {
    findEmail: function(mail) {
        return new Promise((resolve, reject) => {
            let from, to, sender_mail, date, email_date, email_timestamp, subject;
            from = mail.from.value[0].name;
            to = mail.to.value[0].address;
            date = mail.date
            email_date = mail.date
            email_timestamp = new Date(mail.date).getTime()
            subject = mail.subject;
            if (((mail.subject).substring(0, 3) == "Fwd") && ((mail.from.value[0].address).slice(-26) == "@excellencetechnologies.in")) {
                let email_ids = mail.text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
                let fwdedFrom = mail.text.split("\n");
                let name = ((fwdedFrom[1].split((fwdedFrom[1].split(" "))[0] + " "))[1].split(" " + "<" + email_ids[0] + ">"))[0];
                sender_mail = email_ids[0]
                let data = {
                    from: name,
                    to: to,
                    sender_mail: sender_mail,
                    date: date,
                    email_date: email_date,
                    email_timestamp: email_timestamp,
                    subject: subject
                }
                resolve(data)
            } else {
                sender_mail = mail.from.value[0].address;
                let data = {
                    from: from,
                    to: to,
                    sender_mail: sender_mail,
                    date: date,
                    email_date: email_date,
                    email_timestamp: email_timestamp,
                    subject: subject
                }
                resolve(data)
            }
        });
    }
}