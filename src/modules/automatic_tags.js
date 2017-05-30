import db from "../db"
module.exports = {
    tags: function(subject) {
        return new Promise((resolve, reject) => {
            let tag = "";
            db.Tag.findAll({
                    type: "Automatic"
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        let res = new RegExp(data[i].title, 'gi');
                        if (subject.match(res)) {
                            resolve({ tags: subject.match(res), id: data[i].id });
                        } else {
                            resolve({ tags: null, id: null })
                        }
                    }
                })

        })

    }
};
