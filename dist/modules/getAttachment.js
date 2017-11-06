"use strict";

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _base64Stream = require("base64-stream");

var _base64Stream2 = _interopRequireDefault(_base64Stream);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _googleapis = require("googleapis");

var _googleapis2 = _interopRequireDefault(_googleapis);

var _googleDrive = require("google-drive");

var _googleDrive2 = _interopRequireDefault(_googleDrive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mime = require('mime-types');

var replaceExt = require('replace-ext');

var OAuth2 = _googleapis2.default.auth.OAuth2;
var oauth2Client = new OAuth2(process.env.CLIENT_ID || _config2.default.CLIENT_ID, process.env.CLIENT_SECRET || _config2.default.CLIENT_SECRET, process.env.REDIRECT_URL || _config2.default.REDIRECT_URL);

oauth2Client.setCredentials({
    access_token: process.env.access_token || _config2.default.access_token,
    token_type: process.env.token_type || _config2.default.token_type,
    expiry_date: process.env.expiry_date || _config2.default.expiry_date,
    refresh_token: process.env.refresh_token || _config2.default.refresh_token
}, function (err) {
    console.log(err);
});
var drive = _googleapis2.default.drive({
    version: "v2",
    auth: oauth2Client
});
var filepath = "";
var attach = [];
var self = module.exports = {
    getAttachment: function getAttachment(imap, uid) {
        return new Promise(function (resolve, reject) {
            attach = [];

            function openInbox(cb) {
                imap.openBox("INBOX", true, cb);
            }
            imap.once("ready", function () {
                openInbox(function () {
                    var a_attachments = '';
                    var a_attrs = '';
                    var f = imap.fetch(uid, {
                        bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                        struct: true
                    });
                    f.on("message", function (msg, seqno) {
                        var prefix = "(#" + seqno + ") ";
                        msg.once("attributes", function (attrs) {
                            var attachments = self.findAttachmentParts(attrs.struct);
                            a_attachments = attachments;
                            a_attrs = attrs;
                        });
                        msg.once("end", function () {
                            console.log("Finished");
                        });
                    });
                    f.once("error", function (err) {
                        reject("Fetch error: " + err);
                    });

                    function saveData(imap, attachments, attrs) {
                        var uid = attrs.uid;
                        var flag = attrs.flags;
                        var length = attachments.length;
                        if (attachments[0] == null) {
                            resolve(attach);
                        } else {
                            var attachment = attachments.splice(0, 1);
                            var f = imap.fetch(attrs.uid, {
                                bodies: [attachment[0].partID],
                                struct: true
                            });
                            f.on('message', function (msg, seq) {
                                msg.on("body", function (stream) {
                                    var filename = attachment[0].disposition.params.filename;
                                    var encoding = attachment[0].encoding;
                                    var myDir = __dirname + "/uploads";
                                    if (!_fs2.default.existsSync(myDir)) {
                                        _fs2.default.mkdirSync(myDir);
                                    }
                                    filepath = _path2.default.join(__dirname, "/uploads/", filename);
                                    self.filesave(stream, filepath, filename, encoding).then(function (data) {
                                        if (_path2.default.extname(filepath) == ".docx") {
                                            _fs2.default.rename(filepath, replaceExt(filepath, '.doc'), function (err) {
                                                if (err) console.log('ERROR: ' + err);
                                                filepath = replaceExt(filepath, '.doc');
                                                filename = replaceExt(filename, '.doc');
                                                self.driveUpload(filepath, filename).then(function (data) {
                                                    attach.push(data);
                                                    saveData(imap, attachments, attrs);
                                                }).catch(function (err) {
                                                    reject(err);
                                                });
                                            });
                                        } else {
                                            self.driveUpload(filepath, filename).then(function (data) {
                                                attach.push(data);
                                                saveData(imap, attachments, attrs);
                                            }).catch(function (err) {
                                                reject(err);
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    }
                    f.once("end", function () {
                        saveData(imap, a_attachments, a_attrs);
                    });
                });
            });
            imap.once("error", function (err) {
                reject(err);
            });
            imap.once("end", function () {
                console.log("Connection ended");
            });
            imap.connect();
        });
    },

    findAttachmentParts: function findAttachmentParts(struct, attachments) {
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
    filesave: function filesave(stream, filepath, filename, encoding) {
        return new Promise(function (resolve, reject) {
            var writeStream = _fs2.default.createWriteStream(filepath);
            writeStream.on("finish", function () {
                _fs2.default.readFile(filename, {
                    encoding: encoding
                }, function () {
                    resolve(_fs2.default);
                });
            });
            if (encoding === "BASE64") {
                stream.pipe(_base64Stream2.default.decode()).pipe(writeStream);
            } else {
                stream.pipe(writeStream);
            }
        });
    },
    driveUpload: function driveUpload(filepath, filename) {
        return new Promise(function (resolve, reject) {
            var folderId = process.env.folderid || _config2.default.folderid;
            var drive = _googleapis2.default.drive({ version: 'v3', auth: oauth2Client });
            _fs2.default.readFile(filepath, function (err, result) {
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
                }, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        var attachment_file = {
                            name: filename,
                            link: "https://drive.google.com/file/d/" + result.id + "/preview?usp=drivesdk"
                        };
                        _fs2.default.unlink(filepath, function () {
                            console.log("success");
                            resolve(attachment_file);
                        });
                    }
                });
            });
        });
    }
};
//# sourceMappingURL=getAttachment.js.map