const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const authController = require('../middleware/auth');

router.get("/", chatController.getChat);

router.route("/chat").get(authController.authorization, chatController.getChats).post(authController.authorization, chatController.postChat);

router.post("/create-group", authController.authorization, chatController.createGroup);

router.get("/get-mygroups", authController.authorization, chatController.getMyGroups);

router.get('/get-group-messages', authController.authorization, chatController.getGroupChatHistory)

router.get("/get-users", authController.authorization, chatController.getAllUser);

router.get("/get-users-group", authController.authorization, chatController.getUsersInGroups);

router.post("/update-group", authController.authorization, chatController.postUpdateGroup);

module.exports = router;