import constant from '../models/constant';
import _ from "lodash";
import moment from "moment";

let dashboard = (db, req) => {
    return new Promise((resolve, reject) => {
        let months = []
        let month_days = []
        let day_wise_data = []
        let month_wise_stats = []
        let round_data = []
        let rounds = []
        db.Tag.findAll({ where: { "is_job_profile_tag": 1 } }).then((job_profile) => {
            findJobProfileStat(job_profile, function(job_profile_response) {
                findEmailStats(function(email_per_day_stat) {
                    job_profile_response["email_stat"] = email_per_day_stat;
                    candidateSelectionPerMonth(function(selected_candidate_stats) {
                        job_profile_response["selected_candidate"] = selected_candidate_stats
                        resolve(job_profile_response)
                    })
                })
            })
        })


        function findJobProfileStat(job_profile, callback) {
            let profile = job_profile.splice(0, 1)[0];
            let dateTime = new Date();
            let start = moment(dateTime).add(1, 'days').format("YYYY-MM-DD");
            let end = moment(start).subtract(1, 'months').format("YYYY-MM-DD");
            req.email.find({ tag_id: profile.id.toString(), date: { "$gte": end, "$lt": start } }, { date: 1 }).exec(function(err, response) {
                let day_data = {}
                let count = 0
                let data = []
                month_days = []
                start = moment(start).subtract(1, 'days').format("YYYY-MM-DD")
                findMonthDates(start, end, function(dates) {
                    monthWiseData(profile, function(month_wise_data) {
                        roundDistribution(profile, function(rounds_description) {
                            _.forEach(dates, (val, key) => {
                                count = 0
                                _.forEach(response, (val1, key1) => {
                                    if (moment(val).format("YYYY-MM-DD") == moment(val1.date).format("YYYY-MM-DD")) {
                                        count++
                                    }
                                    if (key1 == response.length - 1) {
                                        data.push(count)
                                    }
                                })
                                if (key == dates.length - 1) {
                                    if (job_profile.length) {
                                        day_wise_data.push({ data: data, label: profile.title, dates: dates })
                                        findJobProfileStat(job_profile, callback)
                                    } else {
                                        day_wise_data.push({ data: data, label: profile.title, dates: dates })
                                        callback({ day_wise: day_wise_data, month_wise: month_wise_data, rounds: rounds_description })
                                    }
                                }
                            })
                        })
                    })
                })
            })
        }

        function findMonthDates(start, end, callback) {
            if (new Date(start) > new Date(end)) {
                month_days.push(moment(end).format("YYYY-MM-DD"))
                end = moment(end).add(1, 'days');
                findMonthDates(start, end, callback)
            } else {
                callback(month_days)
            }
        }

        function getMonthData(start, end, callback) {
            if (new Date(end).getMonth() <= new Date(start).getMonth()) {
                months.push(new Date(end).getMonth());
                end = moment(end).add(1, 'months').format("YYYY-MM-DD");
                getMonthData(start, end, callback)
            } else {
                callback(months)
            }
        }

        function monthWiseData(profile, callback) {
            let year = new Date().getFullYear()
            let start = moment(new Date()).format("YYYY-MM-DD");
            let end = moment(new Date(year, 0, 1)).format("YYYY-MM-DD");
            let count = 0;
            let month_data = []
            let month = []
            months = []
            req.email.find({ tag_id: profile.id.toString(), date: { "$gte": end, "$lt": start } }, { date: 1 }).exec(function(err, response) {
                getMonthData(start, end, function(month_details) {
                    _.forEach(month_details, (val, key) => {
                        count = 0
                        month.push(constant().months_list[val])
                        _.forEach(response, (val1, key1) => {
                            if (val1.date.getMonth() == val) {
                                count++
                            }
                            if (key1 == response.length - 1) {
                                month_data.push(count)
                            }
                        })
                        if (key == month_details.length - 1) {
                            month_wise_stats.push({ data: month_data, label: profile.title, months: month })
                            callback(month_wise_stats)
                        }
                    })
                })
            })
        }

        function roundDistribution(profile, callback) {
            let count = 0
            let data = []
            req.email.find({ tag_id: profile.id.toString() }, { shedule_for: 1 }).exec(function(err, job_profile_data) {
                getRounds(function(round_info) {
                    _.forEach(constant().shedule_for, (val, key) => {
                        count = 0
                        _.forEach(job_profile_data, (val1, key1) => {
                            if (val.value == val1.shedule_for) {
                                count++
                            }
                            if (key1 == job_profile_data.length - 1) {
                                data.push(count)
                            }
                        })
                        if (key == constant().shedule_for.length - 1) {
                            round_data.push({ data: data, label: profile.title, rounds: rounds })
                            callback(round_data)
                        }
                    })
                })
            })
        }

        function getRounds(callback) {
            _.forEach(constant().shedule_for, (val, key) => {
                if (rounds.indexOf(val.text) < 0) {
                    rounds.push(val.text)
                }
                if (key == constant().shedule_for.length - 1) {
                    callback(rounds)
                }
            })
        }

        function findEmailStats(callback) {
            let dateTime = new Date();
            let start = moment(dateTime).add(1, 'days').format("MMM DD, YYYY HH:mm");
            let end = moment(start).subtract(1, 'months').format("MMM DD, YYYY HH:mm");
            let email_data = []
            let count = 0
            req.emailLogs.find({ time: { "$gte": end, "$lt": start }, user: constant().user }).exec(function(err, email_response) {
                _.forEach(month_days, (val, key) => {
                    count = 0
                    _.forEach(email_response, (val1, key1) => {
                        if (moment(val).format("YYYY-MM-DD") == moment(val1.get('time')).format("YYYY-MM-DD")) {
                            count++
                        }
                        if (key1 == email_response.length - 1) {
                            email_data.push(count)
                            count = 0
                        }
                    })
                    if (key == month_days.length - 1) {
                        callback([{ label: "Automatic Mails", data: email_data, dates: month_days }])
                    }
                })
            })
        }

        function candidateSelectionPerMonth(callback) {
            db.Tag.findOne({ where: { title: constant().selected, type: constant().tagType.default } })
                .then((selected_tag_info) => {
                    let year = new Date().getFullYear()
                    let start = moment(new Date()).format("MMM DD, YYYY HH:mm");
                    let end = moment(new Date(year, 0, 1)).format("MMM DD, YYYY HH:mm");
                    let count = 0;
                    let selected_count = [];
                    let month = []
                    req.email.find({ updated_time: { "$gte": end, "$lt": start }, default_tag: selected_tag_info.id.toString() }, { updated_time: 1 }).exec(function(err, selected_candidate) {
                        console.log(selected_candidate.length)
                        _.forEach(months, (val, key) => {
                            count = 0
                            month.push(constant().months_list[val])
                            _.forEach(selected_candidate, (val1, key1) => {
                                if (val1.updated_time.getMonth() == val) {
                                    count++
                                }
                                if (key1 == selected_candidate.length - 1) {
                                    selected_count.push(count)
                                    count = 0
                                }
                            })
                            if (key == months.length - 1) {
                                callback([{ label: "Selected Candidate", data: selected_count, month: month}])
                            }
                        })
                    })
                })
        }
    })
}

export default {
    dashboard
}