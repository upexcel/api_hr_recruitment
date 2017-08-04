import constant from "../models/constant";
import _ from "lodash";

const userActivityLogs = (req, response) => {
    return new Promise((resolve, reject) => {
        if (!req.user) {
            resolve()
        } else {
            let api_log_record = true
            _.forEach(constant().ignored_api_log_list, (val, key) => {
                if (req.path.match(new RegExp(val, 'gi'))) {
                    api_log_record = false
                }
                if (key == constant().ignored_api_log_list.length - 1 && !api_log_record) {
                    resolve()
                }
            })
            if (api_log_record) {
                response = response.data ? response.data.dataValues : response.dataValues;
                req.user_activity.findOne({ email: req.user.email }).exec(function(err, result) {
                    let history = { time: new Date(), requested_api: req.originalUrl, sucsess_response_json: response }
                    if (result) {
                        req.user_activity.update({ "email": req.user.email }, { "$push": { "action": req.originalUrl.toString(), "time": new Date().toString(), "json": response } }).exec(function(err, result) {
                            resolve("sucess")
                        })
                    } else {
                        var activity = new req.user_activity({ "email": req.user.email, "action": [req.originalUrl.toString()], time: [new Date().toString()], json: [response] })
                        activity.save(function(err, result) {
                            resolve("sucess")
                        })
                    }
                })
            }
        }
    })
}

export default {
    userActivityLogs
}