const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Chat = require('./chat');

const Group = sequelize.define('Groups', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING(50),
        unique: true,
        notEmpty: true,
    },
    membersNo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
},
    {
        timestamps: false
    });


Group.hasMany(Chat, { foreignKey: 'groupId' });
Chat.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = Group;
