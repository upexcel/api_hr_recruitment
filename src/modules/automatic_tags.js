import db from "../db"
module.exports = {
    tags: function(subject) {
        return new Promise((resolve, reject) => {
            let tag = "";
            db.Tag.findAll({
                    where: {
                        type: "Automatic"
                    }
                })
                .then((data) => {
                    console.log(subject)
                    for (let i = 0; i < data.length; i++) {
                        let res = new RegExp(data[i].title, 'gi');
                        console.log(subject.match(res))
                        if (subject.match(res) != null && i < data.length) {
                            console.log(i)
                            resolve({ tags: subject.match(res), id: data[i].id });
                        } else {
                            if (i < data.length - 1) {
                                console.log(i)
                                continue;
                            } else {
                                resolve({ tags: null, id: null })
                            }
                        }
                    }
                })
        })
    }
};
