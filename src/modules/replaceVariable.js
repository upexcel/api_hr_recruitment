import db from "../db"
let date = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear();
module.exports = {
    filter: function(body, from, callback) {
        db.Variable.findAll({})
            .then((data) => {
                let str = "";
                for (let i = 0; i < data.length; i++) {
                            str = body.replace(data[i].dataValues.variableCode, data[i].dataValues.variableValue)
                            body = str;
                        }
                let res = body.replace("#candidate_name", from).replace("#date|MMM Do YY|", date);
                callback(res);
            })
    }
};
