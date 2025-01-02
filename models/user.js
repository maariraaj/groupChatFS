const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const Chat = require('./chat');
const Groups = require('./group');
const GroupMember = require('./groupMember');

const User = sequelize.define("User", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[0-9]+$/i,
        },
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

User.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Groups, { through: GroupMember });
Groups.belongsToMany(User, { through: GroupMember });
Groups.belongsTo(User, { foreignKey: 'AdminId', constraints: true, onDelete: 'CASCADE' });

module.exports = User;