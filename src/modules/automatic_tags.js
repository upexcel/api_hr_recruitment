import db from "../db"
module.exports = {
    tags: function(subject, callback) {
        db.Tag.findAll({
                type: "Automatic"
            })
            .then((data) => {
                let tag = "";
                for (let i = 0; i < data.length; i++) {
                    let res = new RegExp(data[i].title, 'gi');
                    tag = subject.match(res);
                }
                callback(tag);
            })
    }
};
