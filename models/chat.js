const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Chat = sequelize.define("Chat", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isImage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    date_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
});

module.exports = Chat;