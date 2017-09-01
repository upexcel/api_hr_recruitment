import constant from '../models/constant';
import _ from "lodash";

let dashboard = (db, req) => {
    return new Promise((resolve, reject) => {
        let profile_stat = {};
        let job_profile_data = [];
        let imap_records = [];
        let tagData = {};
        let userData = {};
        let emailLogData = [];
        db.Tag.findAll({ where: { "is_job_profile_tag": 1 } }).then((job_profile) => {
            db.Tag.findAll({ where: { type: "Default" } }).then((default_tag) => {
                findJobProfileCount(job_profile, default_tag, function(profile_response) {
                    findEmailcount(function(inbox) {
                        db.Imap.findAll({}).then((imap_list) => {
                            findImapData(imap_list, function(imap_stat) {
                                db.Tag.findAll({}).then((tag_data) => {
                                    findTagCount(tag_data, function(tag_stat) {
                                        db.User.findAll({}).then((user_data) => {
                                            findUserData(user_data, function(user_stat) {
                                                findEmailLogCount(user_data, function(email_stat) {
                                                    resolve({ profile: profile_response, inbox: inbox, imap: imap_stat, tag: tag_stat, user: user_stat, email: email_stat })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })

        function findJobProfileCount(job_profile, default_tag, callback) {
            let profile = job_profile.splice(0, 1)[0];
            req.email.find({ tag_id: profile.id.toString() }).exec(function(err, email) {
                let all_count = email.length;
                _.forEach(default_tag, (val, key) => {
                    let count = 0;
                    _.forEach(email, (val1, key1) => {
                        if (val1.default_tag == val.id) {
                            profile_stat[val.title] = ++count;
                        } else {
                            profile_stat[val.title] = count
                        }
                    })
                    all_count -= count;
                    profile_stat["All"] = all_count;
                    if (key == default_tag.length - 1) {
                        if (job_profile.length) {
                            job_profile_data.push({ profile: profile_stat, title: profile.title });
                            profile_stat = {};
                            findJobProfileCount(job_profile, default_tag, callback)
                        } else {
                            job_profile_data.push({ profile: profile_stat, title: profile.title });
                            profile_stat = {};
                            console.log(job_profile_data)
                            callback(job_profile_data)
                        }
                    }
                })
            })
        }

        function findEmailcount(callback) {
            req.email.find({ tag_id: { "$size": 0 } }, { unread: 1 }).exec(function(err, inbox_data) {
                let unread = 0;
                _.forEach(inbox_data, (val, key) => {
                    if (val.unread) {
                        ++unread;
                    }
                    if (key == inbox_data.length - 1) {
                        callback({ total: inbox_data.length, unread: unread })
                    }
                })
            })
        }

        function findImapData(imapData, callback) {
            let imap = imapData.splice(0, 1)[0];
            findEmailCountByImap(imap, function(email_count) {
                imap_records.push({ email: imap.email, email_fetched: email_count, total_email: imap.total_emails, date: imap.last_fetched_time });
                if (imapData.length) {
                    findImapData(imapData, callback)
                } else {
                    callback(imap_records)
                }
            })
        }

        function findEmailCountByImap(imap_email, callback) {
            req.email.find({ imap_email: imap_email.email }).count().exec(function(err, data) {
                callback(data);
            })
        }

        function findTagCount(tag_data, callback) {
            _.forEach(constant().tag_type, (val, key) => {
                let count = 0;
                _.forEach(tag_data, (val1, key1) => {
                    if (val1.type == val) {
                        ++count
                    }
                    if (key1 == tag_data.length - 1) {
                        tagData[val] = count;
                    }
                })
                if (key == constant().tag_type.length - 1) {
                    callback(tagData)
                }
            })
        }

        function findUserData(user_data, callback) {
            _.forEach(constant().user_type, (val, key) => {
                let count = 0;
                _.forEach(user_data, (val1, key1) => {
                    if (val1.user_type == val) {
                        ++count
                    }
                    if (key1 == user_data.length - 1) {
                        userData[val] = count;
                    }
                })
                if (key == constant().tag_type.length - 1) {
                    callback(userData)
                }
            })
        }

        function findEmailLogCount(user_data, callback) {
            let user = user_data.splice(0, 1)[0];
            findLogCount(user, function(log_count) {
                emailLogData.push({ email_send: log_count, user: user.email });
                if (user_data.length) {
                    findEmailLogCount(user_data, callback)
                } else {
                    callback(emailLogData)
                }
            })
        }

        function findLogCount(user, callback) {
            let count = 0;
            req.emailLogs.find({}).exec(function(err, email_log) {
                _.forEach(email_log, (val, key) => {
                    if (val.get('user') == user.email) {
                        count++
                    }
                    if (key == email_log.length - 1) {
                        callback(count)
                    }
                })

            })
        }
    })
}

export default {
    dashboard
}