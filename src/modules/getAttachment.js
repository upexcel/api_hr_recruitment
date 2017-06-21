import db from "../db"
import path from "path";
import fs from "fs";
import base64 from "base64-stream";
import config from "../config.json";
import google from "googleapis";
import googleDrive from 'google-drive'
var mime = require('mime-types');
var replaceExt = require('replace-ext');

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);
oauth2Client.setCredentials({
    access_token: config.access_token,
    token_type: config.token_type,
    expires_in: config.expires_in,
    refresh_token: config.refresh_token
});
var drive = google.drive({
    version: "v2",
    auth: oauth2Client
});
var filepath = "";
var self = module.exports = {
    getAttachment: function(imap, uid) {
        return new Promise((resolve, reject) => {
            function openInbox(cb) {
                imap.openBox("INBOX", true, cb);
            }
            imap.once("ready", function() {
                openInbox(function() {
                    var f = imap.fetch(uid, {
                        bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                        struct: true
                    });
                    f.on("message", function(msg, seqno) {
                        var prefix = "(#" + seqno + ") ";
                        msg.once("attributes", function(attrs) {
                            const attachments = self.findAttachmentParts(attrs.struct);
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
                                resolve(attachments, uid, flag);
                            } else {
                                f.on("message", self.buildAttMessage(attachment, uid, flag, (err, response) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(response)
                                    }
                                }))
                            }
                        });
                        msg.once("end", function() {
                            console.log("Finished");
                        });
                    });
                    f.once("error", (err) => {
                        reject("Fetch error: " + err);
                    });
                    f.once("end", () => {
                        console.log("Done fetching all messages!");
                        imap.end();
                    });
                });
            });
            imap.once("error", (err) => {
                reject(err);
            });
            imap.once("end", () => {
                console.log("Connection ended");
            });
            imap.connect();
        })

    },

    findAttachmentParts: function(struct, attachments) {
        attachments = attachments || [];
        var len = struct.length;
        for (var i = 0; i < len; ++i) {
            if (Array.isArray(struct[i])) {
                self.findAttachmentParts(struct[i], attachments);
            } else if (struct[i].disposition && ["INLINE", "ATTACHMENT"].indexOf(struct[i].disposition.type) > 0) {
                attachments.push(struct[i]);
            }
        }
        return attachments;
    },

    buildAttMessage: function(attachment, uid, flag, callback) {
        var filename = attachment.disposition.params.filename;
        var encoding = attachment.encoding;
        filepath = path.join(__dirname, "/uploads/", filename);
        return function(msg, seqno) {
            self.filesave(msg, filepath, filename, encoding)
                .then((data) => {
                    if (path.extname(filepath) == ".docx") {
                        fs.rename(filepath, replaceExt(filepath, '.doc'), function(err) {
                            if (err) console.log('ERROR: ' + err);
                            filepath = replaceExt(filepath, '.doc');
                            filename = replaceExt(filename, '.doc');
                            self.driveUpload(filepath, filename)
                                .then((data) => {
                                    callback("", data)
                                })
                        })
                    } else {
                        self.driveUpload(filepath, filename)
                            .then((data) => {
                                callback("", data)
                            })
                    }
                })
        }
    },
    filesave: function(msg, filepath, filename, encoding) {
        return new Promise((resolve, reject) => {
            msg.on("body", function(stream) {
                var writeStream = fs.createWriteStream(filepath);
                writeStream.on("finish", function() {
                    fs.readFile(filename, {
                        encoding: encoding
                    }, function() {
                        resolve(fs);
                    });
                });
                if (encoding === "BASE64") {
                    stream.pipe(base64.decode()).pipe(writeStream);
                } else {
                    stream.pipe(writeStream);
                }

            })
            msg.once("end", function() {
                console.log("Finished ");
            });
        })
    },
    driveUpload: function(filepath, filename) {
        return new Promise((resolve, reject) => {
            var folderId = config.folderid;
            var drive = google.drive({ version: 'v3', auth: oauth2Client });
            fs.readFile(filepath, (err, result) => {
                var req = drive.files.create({
                    resource: {
                        'name': filename,
                        parents: [folderId],
                        mimeType: mime.lookup(filepath)
                    },
                    media: {
                        mimeType: mime.lookup(filepath),
                        body: result
                    },
                    fields: 'id'
                }, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        var attachment_file = [{
                            name: filename,
                            link: "https://drive.google.com/file/d/" + result.id + "/preview?usp=drivesdk"
                        }]
                        fs.unlink(filepath, function() {
                            console.log("success");
                        });
                        resolve(attachment_file)
                    }
                });
            })
        })
    }
}
