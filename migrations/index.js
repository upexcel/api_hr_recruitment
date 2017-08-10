var _ = require("lodash")

module.exports = {
    up: (queryInterface, Sequelize) => {
        return new Promise((resolve, reject) => {
            // logic for transforming into the new state
            let result = []
            let add_field = [
                { table: "TAG", field: "default_id", type: Sequelize.INTEGER, value: 0, allowNull: false },
                { table: "TAG", field: "job_description", type: Sequelize.STRING, value: "", allowNull: false },
                { table: "IMAP", field: "last_fetched_time", type: Sequelize.DATE, value: new Date(), allowNull: false },
                { table: "IMAP", field: "total_emails", type: Sequelize.INTEGER, value: 0, allowNull: false },
                { table: "SMTP", field: "username", type: Sequelize.STRING(255), value: "", allowNull: false }
            ]
            _.forEach(add_field, (val, key) => {
                queryInterface.describeTable(val.table).then(attributes => {
                    if (attributes[val.field]) {
                        result.push(1)
                        if (key == add_field.length - 1 && result.length == add_field.length) {
                            resolve("SUCCESS")
                        }
                    } else if (attributes) {
                        let type = val['type'];
                        result.push(queryInterface.addColumn(val.table, val.field, { type: type, defaultValue: val.value, allowNull: val['allowNull'] }));
                        if (key == add_field.length - 1 && result.length == add_field.length) {
                            resolve("SUCCESS")
                        }
                    } else {
                        result.push(0)
                        if (key == add_field.length - 1 && result.length == add_field.length) {
                            resolve("SUCCESS")
                        }
                    }
                })
            })
        })
    },

    down: (queryInterface, Sequelize) => {
        // logic for reverting the changes
    }
}