var mongoose = require('mongoose'),
    url = 'mongodb://localhost/EMAILPANEL',
    conn = mongoose.connect(url),
    in_array = require('in_array'),
    fs = require('fs'),
    Imap = require('imap'),
    inspect = require('util').inspect;

var google = require('googleapis'),
    googleAuth = require('google-auth-library'),
    OAuth2 = google.auth.OAuth2;

var YOUR_CLIENT_ID = "26456531203-aa7qlroeerjrbaoatql4s5di1pcmir46.apps.googleusercontent.com",
    YOUR_CLIENT_SECRET = "k0jbwm1g1Ow69WiYE_UKu5q4",
    YOUR_REDIRECT_URL = "https://developers.google.com/oauthplayground";

var oauth2Client = new OAuth2(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, YOUR_REDIRECT_URL);
// Retrieve tokens via token exchange explained above or set them:
oauth2Client.setCredentials({
    access_token: "ya29.Gls_BEQkhGIpdPplXqN5rUiACQ4spvr27C02bPtHYp1niYkQPIw-6e3EowzetEr-KWEBEtPkZM5J0KJKcbonkf3fTV_XCjvG5EpYVrl0Ev0I0beLdo0fWoYgKoSq",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "1/vjjHYdLPT7STaQEnv_zXPaWTcpR9dg33oiEbk91m8PE"
});
var drive = google.drive({ version: 'v2', auth: oauth2Client });

var imap = new Imap({
    user: 'vaibhav_pathak@excellencetechnologies.in',
    password: 'VAibhav@1994',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});
var emailSchema = mongoose.Schema({}, {
    collection: 'emailStored',
    strict: false,
});
var email = conn.model('EMAIL', emailSchema);
var headers = {};
var bodyMsg = "";

function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}
imap.once('ready', function() {
    openInbox(function(err, box) {
        // this will fetch all the Emails data from Gmail
        var totalmsgs = box.messages.total;
        var f = imap.seq.fetch("1:1000000", {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)', 'TEXT'],
            struct: true,
        });
        f.on('message', function(msg, seqno) {
            var textmsg = "";
            var prefix = '(#' + seqno + ') ';
            msg.on('body', function(stream, info) {
                var buffer = '';
                stream.on('data', function(chunk) {
                    buffer += chunk.toString('utf8');
                });

                stream.on('end', function() {
                    headers = Imap.parseHeader(buffer)
                    var hash = buffer.substring(buffer.indexOf('<div')),
                        textmsg = hash.substring(0, hash.lastIndexOf("</div>"));
                    if (textmsg !== '') {
                        bodyMsg = textmsg + "</div>";
                    }
                });
            });
            msg.on('attributes', function(attrs) {
                var attachments = findAttachmentParts(attrs.struct);
                var len = attachments.length,
                    uid = attrs.uid,
                    flag = attrs.flags;
                for (var i = 0; i < len; ++i) {
                    var attachment = attachments[i];
                    var f = imap.fetch(attrs.uid, {
                        bodies: [attachment.partID],
                        struct: true
                    });
                }
                if (attachments[0] == null) {
                    database_save(attachments, uid, flag, bodyMsg, seqno)
                } else {
                    buildAttMessageFunction(attachment, uid, flag, bodyMsg, seqno)
                }
            });

            msg.once('end', function() {
                console.log(prefix + 'Finished');
            });
        });
        f.once('error', function(err) {
            console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
            console.log('Done fetching all messages!');
            imap.end();
        });
    });
});

function findAttachmentParts(struct, attachments) {
    attachments = attachments || [];
    var len = struct.length;
    for (var i = 0; i < len; ++i) {
        if (Array.isArray(struct[i])) {
            findAttachmentParts(struct[i], attachments);
        } else {
            if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(struct[i].disposition.type) > 0) {
                attachments.push(struct[i]);
            }
        }
    }
    return attachments;
}

function buildAttMessageFunction(attachment, uid, flag, bodyMsg, seqno) {
    var filename = attachment.params.name,
        encoding = attachment.encoding;
    fs.readFile(filename, { encoding: "utf8" }, function(error, data) {
        var fileMetadata = {
            'title': filename,
            mimeType: 'text/javascript/html/csv'
        };
        var media = {
            mimeType: 'text/javascript/html/csv',
            body: data
        };
        drive.files.insert({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function(err, file) {
            if (!err) {
                attachment_file = [{ "name": attachment.params.name, "link": "https://drive.google.com/file/d/" + file.id + "/view" }];
                database_save(attachment_file, uid, flag, bodyMsg, seqno);
                console.log("=======================================")
                console.log("file is saved");
                console.log("========================================")
            } else {
                console.log(err)
            }
        });
    });

}

function database_save(attachments, uid, flag, bodyMsg, seqno) {
    var emailid = seqno,
        to = headers.to.toString();
    var hash1 = headers.from.toString().substring(headers.from.toString().indexOf('"')),
        from = hash1.substring(0, hash1.lastIndexOf("<"));
    var hash = headers.from.toString().substring(headers.from.toString().indexOf('<') + 1),
        sender_mail = hash.substring(0, hash.lastIndexOf(">"));
    var date = headers.date.toString(),
        email_date = new Date(date).getFullYear() + '-' + (new Date(date).getMonth() + 1) + '-' + new Date(date).getDate(),
        email_timestamp = new Date(date).getTime(),
        subject = headers.subject.toString(),
        uid = uid,
        unread = in_array('[]', flag),
        answered = in_array('\\Answered', flag),
        message = bodyMsg,
        attachment = attachments;

    var detail = new email({
        "email_id": emailid,
        "to": to,
        "from": from,
        "sender_mail": sender_mail,
        "date": date,
        "email_date": email_date,
        "email_timestamp": email_timestamp,
        "subject": subject,
        "uid": uid,
        "unread": unread,
        "answered": answered,
        "body": message,
        "attachment": attachment,
    });
    detail.save(function(err, detail) {
        if (err) {
            console.log(err)
        } else {
            console.log("++++++++++++++++++++++++++++++++++++")
            console.log("data saved successfully");
            console.log("++++++++++++++++++++++++++++++++++++")
        }
    });
}

imap.once('error', function(err) {
    console.log(err);
});
imap.once('end', function() {
    console.log('Connection ended');
});
imap.connect();
