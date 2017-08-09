import db from "../db"
import path from "path";
import fs from "fs";
import base64 from "base64-stream";
import config from "../config";
import google from "googleapis";
import googleDrive from 'google-drive'
var mime = require('mime-types');

var replaceExt = require('replace-ext');

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);

oauth2Client.setCredentials({
    access_token: config.access_token,
    token_type: config.token_type,
    expiry_date: config.expiry_date,
    refresh_token: config.refresh_token
}, (err) => { console.log(err) });
var drive = google.drive({
    version: "v2",
    auth: oauth2Client
});
var filepath = "";
var attach = [];
var self = module.exports = {
    getAttachment: function(imap, uid) {
        return new Promise((resolve, reject) => {
            attach = [];

            function openInbox(cb) {
                imap.openBox("INBOX", true, cb);
            }
            imap.once("ready", function() {
                openInbox(function() {
                    let a_attachments = '';
                    let a_attrs = ''
                    var f = imap.fetch(uid, {
                        bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                        struct: true
                    });
                    f.on("message", function(msg, seqno) {
                        var prefix = "(#" + seqno + ") ";
                        msg.once("attributes", function(attrs) {
                            const attachments = self.findAttachmentParts(attrs.struct);
                            a_attachments = attachments;
                            a_attrs = attrs;
                        });
                        msg.once("end", function() {
                            console.log("Finished");
                        });
                    });
                    f.once("error", (err) => {
                        reject("Fetch error: " + err);
                    });

                    function saveData(imap, attachments, attrs) {
                        var uid = attrs.uid;
                        var flag = attrs.flags;
                        var length = attachments.length
                        if (attachments[0] == null) {
                            resolve(attach)
                        } else {
                            var attachment = attachments.splice(0, 1);
                            var f = imap.fetch(attrs.uid, {
                                bodies: [attachment[0].partID],
                                struct: true
                            });
                            f.on('message', (msg, seq) => {
                                msg.on("body", function(stream) {
                                    var filename = attachment[0].disposition.params.filename;
                                    var encoding = attachment[0].encoding;
                                    var myDir = __dirname + "/uploads";
                                    if (!fs.existsSync(myDir)) {
                                        fs.mkdirSync(myDir);
                                    }
                                    filepath = path.join(__dirname, "/uploads/", filename);
                                    self.filesave(stream, filepath, filename, encoding)
                                        .then((data) => {
                                            if (path.extname(filepath) == ".docx") {
                                                fs.rename(filepath, replaceExt(filepath, '.doc'), function(err) {
                                                    if (err) console.log('ERROR: ' + err);
                                                    filepath = replaceExt(filepath, '.doc');
                                                    filename = replaceExt(filename, '.doc');
                                                    self.driveUpload(filepath, filename)
                                                        .then((data) => {
                                                            attach.push(data)
                                                            saveData(imap, attachments, attrs)
                                                        })
                                                        .catch((err) => { reject(err) })
                                                })
                                            } else {
                                                self.driveUpload(filepath, filename)
                                                    .then((data) => {
                                                        attach.push(data)
                                                        saveData(imap, attachments, attrs)
                                                    })
                                                    .catch((err) => { reject(err) })

                                            }
                                        })
                                })
                            })
                        }
                    }
                    f.once("end", () => {
                        saveData(imap, a_attachments, a_attrs)
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
    filesave: function(stream, filepath, filename, encoding) {
        return new Promise((resolve, reject) => {
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
                        var attachment_file = {
                            name: filename,
                            link: "https://drive.google.com/file/d/" + result.id + "/preview?usp=drivesdk"
                        }
                        fs.unlink(filepath, function() {
                            console.log("success");
                            resolve(attachment_file)
                        });

                    }
                });
            })
        })
    }
}
