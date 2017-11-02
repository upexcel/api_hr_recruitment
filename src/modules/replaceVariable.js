import db from "../db";
import _ from "lodash";
let date = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear();

module.exports = {
    filter: function(body, name, tagId) {
        return new Promise((resolve, reject) => {
            db.Tag.findOne({ where: { id: tagId } })
                .then((tag) => {
                    if (tag) {
                        db.Variable.findAll({})
                            .then((data) => {
                                _.forEach(data, (val, key) => {
                                    function replaceAll(body, find, replace) {
                                        return body.replace(new RegExp(find, 'gi'), replace);
                                    }
                                    body = replaceAll(body, val.variableCode, val.variableValue)
                                })

                                function replaceAll(body, find, replace) {
                                    return body.replace(new RegExp(find, 'gi'), replace);
                                }
                                body = replaceAll(body, "#tag_name", tag.title);
                                let res = body.replace("#candidate_name", name).replace("#date", date);
                                resolve(res);

                            })
                    } else {
                        db.Variable.findAll({})
                            .then((data) => {
                                _.forEach(data, (val, key) => {
                                    function replaceAll(body, find, replace) {
                                        return body.replace(new RegExp(find, 'gi'), replace);
                                    }
                                    body = replaceAll(body, val.variableCode, val.variableValue)
                                })

                                function replaceAll(body, find, replace) {
                                    return body.replace(new RegExp(find, 'gi'), replace);
                                }
                                let res = body.replace("#candidate_name", name).replace("#date", date);
                                resolve(res);

                            })
                    }
                })
        })
    },
    schedule_filter: function(body, name, tagId,scheduled_date,scheduled_time) {
        return new Promise((resolve, reject) => {
            db.Tag.findOne({ where: { id: tagId } })
                .then((tag) => {
                    if (tag) {
                        db.Variable.findAll({})
                            .then((data) => {
                                _.forEach(data, (val, key) => {
                                    function replaceAll(body, find, replace) {
                                        return body.replace(new RegExp(find, 'gi'), replace);
                                    }
                                    body = replaceAll(body, val.variableCode, val.variableValue)
                                })

                                function replaceAll(body, find, replace) {
                                    return body.replace(new RegExp(find, 'gi'), replace);
                                }
                                body = replaceAll(body, "#tag_name", tag.title);
                                let res = body.replace("#candidate_name", name).replace("#date", date).replace("#scheduled_date", scheduled_date).replace("#scheduled_time", scheduled_time);
                                resolve(res);

                            })
                    } else {
                        db.Variable.findAll({})
                            .then((data) => {
                                _.forEach(data, (val, key) => {
                                    function replaceAll(body, find, replace) {
                                        return body.replace(new RegExp(find, 'gi'), replace);
                                    }
                                    body = replaceAll(body, val.variableCode, val.variableValue)
                                })

                                function replaceAll(body, find, replace) {
                                    return body.replace(new RegExp(find, 'gi'), replace);
                                }
                                let res = body.replace("#candidate_name", name).replace("#date", date);
                                resolve(res);

                            })
                    }
                })
        })
    },
    templateTest: function(body) {
        return new Promise((resolve, reject) => {
            db.Variable.findAll({})
                .then((data) => {
                    _.forEach(data, (val, key) => {
                        function replaceAll(body, find, replace) {
                            return body.replace(new RegExp(find, 'gi'), replace);
                        }
                        body = replaceAll(body, val.variableCode, val.variableValue)
                    })
                    let res = body.replace("#date", date);
                    resolve(res);

                })
        })

    }
};