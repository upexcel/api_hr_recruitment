import Sequelize from "sequelize";
import config from "../src/config";

const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password);

module.exports = {
    up: (queryInterface, Sequelize) => {
        return new Promise((resolve, reject) => {
            // logic for transforming into the new state
            queryInterface.addColumn(
                'TAG',
                'default_id', {
                    type: Sequelize.INTEGER,
                    allowNull: true
                });
            queryInterface.addColumn(
                'TAG',
                'job_description', {
                    type: Sequelize.STRING,
                    allowNull: true
                });
            queryInterface.addColumn(
                'IMAP',
                'last_fetched_time', {
                    type: Sequelize.STRING,
                    allowNull: true
                });
            queryInterface.addColumn(
                'IMAP',
                'total_emails', {
                    type: Sequelize.STRING,
                    allowNull: true
                });
        })
    },

    down: (queryInterface, Sequelize) => {
        // logic for reverting the changes
    }
}