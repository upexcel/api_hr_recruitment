"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var config = require("../config.json");

config.port = process.env.port;
config.bodyLimit = process.env.bodyLimit;
config.corsHeaders = process.env.corsHeaders;
config.db.host = JSON.parse(process.env.db).host;
config.db.name = JSON.parse(process.env.db).name;
config.db.password = JSON.parse(process.env.db).password;
config.db.username = JSON.parse(process.env.db).username;
config.mongodb = process.env.mongodb;
config.CLIENT_ID = process.env.CLIENT_ID;
config.CLIENT_SECRET = process.env.CLIENT_SECRET;
config.REDIRECT_URL = process.env.REDIRECT_URL;
config.access_token = process.env.access_token;
config.token_type = process.env.token_type;
config.expiry_date = process.env.expiry_date;
config.refresh_token = process.env.refresh_token;
config.tic_tags_email = process.env.tic_tags_email;
config.is_silent = process.env.is_silent;
config.folderid = process.env.folderid;
config.age_server_key = process.env.age_server_key;
config.ACCOUNT_SID = process.env.ACCOUNT_SID;
config.AUTH_TOKEN = process.env.AUTH_TOKEN;
config.TRACKING_ID = process.env.TRACKING_ID;
config.NODE_ENV = process.env.NODE_ENV;

exports.default = config;
//# sourceMappingURL=config.js.map