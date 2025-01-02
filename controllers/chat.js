const path = require('path');
const Chat = require('../models/chat');
const User = require('../models/user');
const GroupMember = require("../models/groupMember");
const Group = require("../models/group");
const { Op } = require("sequelize");

exports.getChat = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/chat/chat.html'));
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: User,
      order: [["createdAt", "DESC"]],
    });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).send("Server error");
  }
};

exports.postChat = async (req, res) => {
  const { message, userId, username, currentGroupId } = req.body;
  try {
    const chat = await Chat.create({ message, userId, groupId: currentGroupId });
    const data = {
      name: username,
      message: chat.dataValues.message,
      groupId: chat.dataValues.groupId,
      userId: chat.dataValues.userId,
      updatedAt: chat.dataValues.updatedAt,
      createdAt: chat.dataValues.createdAt
    };
    res.status(201).json(data);
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).send('Server error');
  }
};

exports.createGroup = async (req, res) => {
  try {
    const user = req.user;
    const { name, membersNo, membersIds, description } = req.body;
    const group = await user.createGroup({
      name,
      membersNo,
      AdminId: user.id,
      description
    })
    membersIds.push(user.id);
    await group.addUsers(membersIds.map((ele) => {
      return Number(ele)
    }));
    return res.status(200).json({ group, message: "Group is successfully created" })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server error!' })
  }
}

exports.getMyGroups = async (req, res) => {
  try {
    const user = req.user;
    const groups = await user.getGroups();
    return res.status(200).json({ groups, message: "All groups successfully fetched" })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server error!' });
  }
}

exports.getAllUser = async (req, res) => {
  try {
    const user = req.user;
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'mobile'],
      where: {
        id: {
          [Op.not]: user.id
        }
      }
    });
    return res.status(200).json({ users, message: "All users successfully fetched" })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server error!' })
  }
}

exports.getGroupChatHistory = async (req, res) => {
  try {
    const { groupId } = req.query;
    let whereClause = { where: {} };
    if (groupId !== undefined) {
      whereClause.where.groupId = groupId;
    }
    else {
      whereClause.where.groupId = undefined;
    }
    const chatHistories = await Chat.findAll({
      include: [
        {
          model: User
        }
      ],
      order: [['date_time', 'DESC']],
      where: whereClause.where
    });
    const chats = chatHistories.map((ele) => {
      const curUser = ele.User;
      return {
        messageId: ele.id,
        message: ele.message,
        groupId: ele.groupId,
        user: curUser.name,
        userId: curUser.id,
        date_time: ele.date_time
      }
    })
    return res.status(200).json({ chats, message: "User chat History Fetched" })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server error!' })
  }
}

exports.getUsersInGroups = async (req, res) => {
  const { groupId } = req.query;

  try {
    const groupMembers = await GroupMember.findAll({
      where: { GroupId: groupId },
      attributes: ['UserId'],
    });

    const userIds = groupMembers.map(member => member.UserId);

    const users = await User.findAll({
      where: {
        id: userIds,
      },
      attributes: ['id', 'name', 'email', 'mobile'],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'An error occurred.', error });
  }
};

exports.postUpdateGroup = async (req, res) => {
  const { groupId } = req.query;
  const { name, membersNo, description, membersIds, adminId } = req.body;

  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    await group.update({
      name: name,
      membersNo: membersNo,
      description: description,
      AdminId: adminId
    });
    membersIds.push(adminId);

    if (membersIds && Array.isArray(membersIds)) {
      const validUsers = await User.findAll({
        where: { id: membersIds },
      });

      const validUserIds = validUsers.map(user => user.id);

      await GroupMember.destroy({ where: { GroupId: groupId } });

      const groupMemberEntries = validUserIds.map(userId => ({
        UserId: userId,
        GroupId: groupId,
      }));

      await GroupMember.bulkCreate(groupMemberEntries);
    }

    return res.status(200).json({ message: 'Group updated successfully.', group, });
  } catch (error) {
    console.error('Error updating group:', error);
    return res.status(500).json({ message: 'An error occurred while updating the group.', error, });
  }
};