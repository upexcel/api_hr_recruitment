import db from "../db"
let date = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear();

module.exports = {
    filter: function(body, name, tagId) {
        return new Promise((resolve, reject) => {
            db.Tag.findOne({ where: { id: tagId } })
                .then((tag) => {
                    if (tag) {
                        db.Variable.findAll({})
                            .then((data) => {
                                for (let i = 0; i < data.length; i++) {
                                    function replaceAll(body, find, replace) {
                                        return body.replace(new RegExp(find, 'g'), replace);
                                    }
                                    body = replaceAll(body, data[i].dataValues.variableCode, data[i].dataValues.variableValue)
                                    if (i == data.length - 1) {
                                        let res = body.replace("#candidate_name", name).replace("#date|MMM Do YY|", date).replace("#tag_name", tag.title);
                                        resolve(res);
                                    }
                                }

                            })
                    }
                })
        })
    },
    templateTest: function(body) {
        return new Promise((resolve, reject) => {
            db.Variable.findAll({})
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        function replaceAll(body, find, replace) {
                            return body.replace(new RegExp(find, 'g'), replace);
                        }
                        body = replaceAll(body, data[i].dataValues.variableCode, data[i].dataValues.variableValue)
                        if (i == data.length - 1) {
                            let res = body.replace("#date|MMM Do YY|", date);
                            resolve(res);
                        }
                    }

                })
        })

    }
};
