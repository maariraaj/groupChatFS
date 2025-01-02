const bcrypt = require("bcrypt");
const path = require('path');
const User = require("../models/user");
const jwt = require('jsonwebtoken');

exports.getSignup = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/auth/signup.html'));
};

exports.postSignUp = async (req, res) => {
    const { name, email, mobile, password } = req.body;
    if (!email || !mobile || !password || !name) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const existingEmail = await User.findOne({ where: { email } });
        const existingMobile = await User.findOne({ where: { mobile } });

        if (existingEmail) {
            return res.status(409).json({ error: "Email ID already exists." });
        }
        if (existingMobile) {
            return res.status(409).json({ error: "Mobile number already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, mobile, password: hashedPassword });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "An error occurred. Please try again." });
    }
};

exports.getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/auth/login.html'));
};

const generateAccessToken = (id, name) => {
    return jwt.sign({ userId: id, name }, process.env.JWT_KEY);
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Incorrect email ID or password." });
        }
        return res.status(200).json({ message: "User login successful.", user: { id: user.id, name: user.name, token: generateAccessToken(user.id, user.name) } });
    } catch (error) {
        console.log("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};