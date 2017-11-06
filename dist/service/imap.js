"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.imapConnection = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _imap = require("imap");

var _imap2 = _interopRequireDefault(_imap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var imapConnection = exports.imapConnection = function () {
    function imapConnection() {
        _classCallCheck(this, imapConnection);
    }

    _createClass(imapConnection, [{
        key: "imapConnection",
        value: function imapConnection(imap) {
            return new Promise(function (resolve, reject) {
                function openInbox(cb) {
                    imap.openBox("INBOX", true, cb);
                }
                imap.once("ready", function () {
                    openInbox(function (err, box) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(box);
                        }
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
        }
    }, {
        key: "imapCredential",
        value: function imapCredential(data) {
            return new Promise(function (resolve, reject) {
                var imap = new _imap2.default({
                    user: data.dataValues.email,
                    password: data.dataValues.password,
                    host: "imap.gmail.com",
                    port: 993,
                    tls: "TLS"
                });
                resolve(imap);
            });
        }
    }]);

    return imapConnection;
}();

var imap = new imapConnection();
exports.default = imap;
//# sourceMappingURL=imap.js.map