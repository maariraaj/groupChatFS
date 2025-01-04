const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const authController = require('../middleware/auth');
const multerMiddleware = require('../middleware/multer')

const upload = multerMiddleware.multer.single('image');

router.get("/", chatController.getChat);

router.route("/chat").get(authController.authorization, chatController.getChats).post(authController.authorization, chatController.postChat);

router.post("/create-group", authController.authorization, chatController.createGroup);

router.get("/get-mygroups", authController.authorization, chatController.getMyGroups);

router.get('/get-group-messages', authController.authorization, chatController.getGroupChatHistory)

router.post('/post-image', authController.authorization, upload, chatController.saveChatImages);

router.get("/get-users", authController.authorization, chatController.getAllUser);

router.get("/get-users-group", authController.authorization, chatController.getUsersInGroups);

router.post("/update-group", authController.authorization, chatController.postUpdateGroup);

module.exports = router;