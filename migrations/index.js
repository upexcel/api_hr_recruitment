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
                { table: "SMTP", field: "username", type: Sequelize.STRING(255), value: "", allowNull: false },
                { table: "TAG", field: "is_email_send", type: Sequelize.BOOLEAN, value: 0, allowNull: false },
                { table: "TAG", field: "priority", type: Sequelize.INTEGER, value: 0, allowNull: true },
                { table: "IMAP", field: "days_left_to_fetched", type: Sequelize.INTEGER, value: 0, allowNull: true },
                { table: "IMAP", field: "fetched_date_till", type: Sequelize.DATE, value: 0, allowNull: true },
                { table: "TAG", field: "parent_id", type: Sequelize.INTEGER, value: 0, allowNull: true },
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
                        result.push(queryInterface.addColumn(val.table, val.field, { type: type, defaultValue: val.value || null, allowNull: val['allowNull'] }));
                        if (key == add_field.length - 1 && result.length == add_field.length) {
                            resolve("SUCCESS")
                        }
                    } else {
                        result.push(0)
                        if (key == add_field.length - 1 && result.length == add_field.length) {
                            resolve("SUCCESS")
                        }
                    }
                }, (err) => {
                    console.log("Incorrect Sequelize Db Details");
                    process.exit(0)
                })
            })
            queryInterface.sequelize.query("UPDATE TAG SET title='First Round' WHERE title='Schedule_first_round'")
            queryInterface.sequelize.query("UPDATE TAG SET title='Second Round' WHERE title='Schedule_second_round'")
            queryInterface.sequelize.query("UPDATE TAG SET title='Third Round' WHERE title='Schedule_third_round'")
            queryInterface.sequelize.query("UPDATE TAG SET default_id=6 WHERE title='Reject'")
        })
    },

    down: (queryInterface, Sequelize) => {
        return new Promise((resolve, reject) => {
            // logic for reverting the changes
            queryInterface.bulkDelete('TAG', [{ title: "Ignore" }])
            queryInterface.bulkDelete('TAG', [{ title: "Schedule" }])
        })
    }
}